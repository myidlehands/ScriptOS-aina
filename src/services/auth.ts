
// Google Identity Services (GIS) wrapper

const CLIENT_ID = '984022838682-ujuse7q5pummr5rt2empb7fd3dl2qa46.apps.googleusercontent.com';
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly'
].join(' ');

let tokenClient: any = null;

export const initGoogleAuth = (callback: (response: any) => void) => {
  if (typeof window !== 'undefined' && (window as any).google) {
    tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: callback,
    });
  }
};

export const requestAccessToken = () => {
  if (tokenClient) {
    tokenClient.requestAccessToken();
  } else {
    console.error("Token Client not initialized. Check internet connection or GSI script.");
  }
};