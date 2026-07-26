import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Checks if we have keys in env or localStorage
export const getFirebaseConfig = () => {
  const localConfig = localStorage.getItem('gideao_firebase_config');
  if (localConfig) {
    try {
      return JSON.parse(localConfig);
    } catch (e) {
      return null;
    }
  }

  // Check Vite Env variables
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
  }

  return null;
};

let db = null;
let firebaseApp = null;

const config = getFirebaseConfig();

if (config && config.apiKey) {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(config) : getApp();
    db = getFirestore(firebaseApp);
  } catch (error) {
    console.error("Erro ao inicializar o Firebase: ", error);
  }
}

export { db, firebaseApp };

export const saveFirebaseConfig = (newConfig) => {
  localStorage.setItem('gideao_firebase_config', JSON.stringify(newConfig));
  window.location.reload(); // Reload to re-initialize firebase
};

export const clearFirebaseConfig = () => {
  localStorage.removeItem('gideao_firebase_config');
  window.location.reload();
};
