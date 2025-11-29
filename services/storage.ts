
import { Script, StyleDNA, UserProfile } from '../types';

const SCRIPTS_KEY = 'scriptos_scripts';
const STYLES_KEY = 'scriptos_styles';
const PROFILE_KEY = 'scriptos_profile';

export const getScripts = (): Script[] => {
  const data = localStorage.getItem(SCRIPTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveScript = (script: Script): void => {
  const scripts = getScripts();
  const index = scripts.findIndex((s) => s.id === script.id);
  if (index >= 0) {
    scripts[index] = script;
  } else {
    scripts.push(script);
  }
  localStorage.setItem(SCRIPTS_KEY, JSON.stringify(scripts));
};

export const deleteScript = (id: string): void => {
  const scripts = getScripts().filter((s) => s.id !== id);
  localStorage.setItem(SCRIPTS_KEY, JSON.stringify(scripts));
};

export const getStyles = (): StyleDNA[] => {
  const data = localStorage.getItem(STYLES_KEY);
  if (!data) {
    return [
      {
        id: 'default-noir',
        name: 'Noir Detective',
        tone: 'Cynical, Slow-paced, Investigatory',
        structure: 'Cold Open -> Case File -> The Twist -> Conclusion',
        audioSignature: 'Jazz Noir / Rain Sounds',
        description: 'Classic investigative journalism with a dark twist.'
      }
    ];
  }
  return JSON.parse(data);
};

export const saveStyle = (style: StyleDNA): void => {
  const styles = getStyles();
  const index = styles.findIndex((s) => s.id === style.id);
  if (index >= 0) {
    styles[index] = style;
  } else {
    styles.push(style);
  }
  localStorage.setItem(STYLES_KEY, JSON.stringify(styles));
};

// --- PROFILE ---
export const getUserProfile = (): UserProfile | null => {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};
