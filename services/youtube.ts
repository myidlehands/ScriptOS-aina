
import { YouTubeVideo } from "../types";

export interface ChannelRawData {
  title: string;
  description: string;
  customUrl: string;
  subscribers: string;
  videoCount: string;
  keywords: string;
  recentVideos: {
    title: string;
    description: string;
  }[];
}

const API_KEY = process.env.YOUTUBE_API_KEY || '';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const fetchChannelDeepData = async (identifier: string): Promise<ChannelRawData | null> => {
  if (!API_KEY) {
    console.error("YouTube API Key is missing");
    return null;
  }
  try {
    let cleanInput = identifier.trim();
    let targetUrl = `${BASE_URL}/channels?part=snippet,contentDetails,statistics,brandingSettings&key=${API_KEY}`;
    let resolutionMethod = 'unknown';

    // 1. Check for Handle (@User) inside the string or as exact match
    const handleMatch = cleanInput.match(/(@[\w\-\.]+)/);
    
    // 2. Logic to build the URL
    if (handleMatch) {
        // Use extracted handle
        targetUrl += `&forHandle=${encodeURIComponent(handleMatch[0])}`;
        resolutionMethod = 'handle';
    } 
    else if (!cleanInput.includes(' ') && cleanInput.startsWith('UC') && cleanInput.length === 24) {
        // Likely a Channel ID
        targetUrl += `&id=${cleanInput}`;
        resolutionMethod = 'id';
    }
    else if (cleanInput.includes('/channel/')) {
        // Extract ID from URL
        const parts = cleanInput.split('/channel/');
        const potentialId = parts[1].split(/[/?]/)[0];
        if (potentialId) {
             targetUrl += `&id=${potentialId}`;
             resolutionMethod = 'url_id';
        }
    }

    // 3. Fallback: If no direct ID/Handle found, Search for the channel
    if (resolutionMethod === 'unknown') {
        const searchUrl = `${BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(cleanInput)}&maxResults=1&key=${API_KEY}`;
        const searchRes = await fetch(searchUrl);
        const searchJson = await searchRes.json();
        
        if (searchJson.items && searchJson.items.length > 0) {
             const foundId = searchJson.items[0].id.channelId;
             targetUrl += `&id=${foundId}`;
        } else {
             console.warn("YouTube Search: No channel found for query:", cleanInput);
             throw new Error("Channel not found via search");
        }
    }

    const channelRes = await fetch(targetUrl);
    const channelJson = await channelRes.json();

    if (!channelJson.items || channelJson.items.length === 0) {
      throw new Error("Channel not found");
    }

    const item = channelJson.items[0];
    const uploadsPlaylistId = item.contentDetails?.relatedPlaylists?.uploads;

    // 4. Fetch Recent Videos from Uploads Playlist
    let recentVideos: { title: string; description: string }[] = [];
    if (uploadsPlaylistId) {
      const videosUrl = `${BASE_URL}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=5&key=${API_KEY}`;
      const videosRes = await fetch(videosUrl);
      const videosJson = await videosRes.json();
      
      if (videosJson.items) {
        recentVideos = videosJson.items.map((v: any) => ({
          title: v.snippet.title,
          description: v.snippet.description.substring(0, 200) // Truncate description to save tokens
        }));
      }
    }

    // 5. Construct Data Object
    return {
      title: item.snippet.title,
      description: item.snippet.description,
      customUrl: item.snippet.customUrl,
      subscribers: item.statistics.subscriberCount,
      videoCount: item.statistics.videoCount,
      keywords: item.brandingSettings?.channel?.keywords || '',
      recentVideos
    };

  } catch (error) {
    console.error("YouTube API Error:", error);
    return null;
  }
};

export const getVideoDetails = async (urlOrId: string): Promise<YouTubeVideo | null> => {
  if (!API_KEY) return null;
  
  try {
    let videoId = '';
    // Extract ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = urlOrId.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else if (urlOrId.length === 11) {
      videoId = urlOrId;
    } else {
      return null;
    }

    const url = `${BASE_URL}/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`;
    const res = await fetch(url);
    const json = await res.json();

    if (!json.items || json.items.length === 0) return null;

    const item = json.items[0];
    const viewCount = parseInt(item.statistics.viewCount || '0', 10);
    const publishDate = new Date(item.snippet.publishedAt);
    const daysSincePublished = Math.max(1, (Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
       id: item.id,
       title: item.snippet.title,
       channelTitle: item.snippet.channelTitle,
       thumbnailUrl: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.medium?.url,
       publishedAt: item.snippet.publishedAt,
       viewCount: viewCount.toLocaleString(),
       viralVelocity: Math.round(viewCount / daysSincePublished),
       description: item.snippet.description
    };
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const searchVideos = async (query: string): Promise<YouTubeVideo[]> => {
  if (!API_KEY) return [];
  try {
    // 1. Search for video IDs
    const searchUrl = `${BASE_URL}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=6&order=relevance&key=${API_KEY}`;
    const searchRes = await fetch(searchUrl);
    const searchJson = await searchRes.json();

    if (!searchJson.items) return [];

    const videoIds = searchJson.items.map((item: any) => item.id.videoId).join(',');

    // 2. Fetch statistics for these videos (view counts are not in search results)
    const statsUrl = `${BASE_URL}/videos?part=statistics,snippet&id=${videoIds}&key=${API_KEY}`;
    const statsRes = await fetch(statsUrl);
    const statsJson = await statsRes.json();

    if (!statsJson.items) return [];

    // 3. Map to YouTubeVideo interface
    return statsJson.items.map((item: any) => {
      const viewCount = parseInt(item.statistics.viewCount || '0', 10);
      const publishDate = new Date(item.snippet.publishedAt);
      const daysSincePublished = Math.max(1, (Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
      const viralVelocity = Math.round(viewCount / daysSincePublished);

      return {
        id: item.id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        publishedAt: item.snippet.publishedAt,
        viewCount: viewCount.toLocaleString(),
        viralVelocity: viralVelocity,
        description: item.snippet.description
      };
    });

  } catch (error) {
    console.error("YouTube Search Error:", error);
    return [];
  }
};
