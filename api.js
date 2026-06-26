import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'web'
  ? 'http://127.0.0.1:8000/api'
  : 'http://10.201.254.251:8000/api';

export const AUDIO_BASE_URL = Platform.OS === 'web'
  ? 'http://127.0.0.1:8000'
  : 'http://10.201.254.251:8000';

const api = axios.create({
  baseURL: BASE_URL,
});

// Auto-attach token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// ==========================================
// Auth Endpoints
// ==========================================
export const login = (username, password) =>
  axios.post(`${BASE_URL}/accounts/login/`, { username, password });

export const registerParent = (username, password, email) =>
  api.post('/accounts/register/parent/', { username, password, email });

export const addChild = (username, password, age, language) =>
  api.post('/accounts/add-child/', { username, password, age, language });

// ==========================================
// Chat Endpoints
// ==========================================
export const sendChat = (message, language) =>
  api.post('/chat/message/', { message, language });

// Handles multi-part FormData for audio files along with metadata
export const sendVoiceChat = async (uri, langCode, audioBlob, ext) => {
  const formData = new FormData();
  formData.append('lang', langCode);

  if (audioBlob && ext) {
    // Web: use the Blob directly
    formData.append('audio', audioBlob, `recording.${ext}`);
  } else {
    // Mobile: use the file URI
    formData.append('audio', {
      uri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    });
  }

  // Manually attach token directly — bypasses any interceptor timing issue
  const token = await AsyncStorage.getItem('token');
  console.log('🔑 Token for voice request:', token);

  return api.post('/chat/voice/', formData, {
    headers: {
      'Authorization': `Token ${token}`,
      // Do NOT set Content-Type manually for FormData —
      // the browser must auto-generate the multipart boundary.
    },
  });
};

// ==========================================
// Stories & Games Endpoints
// ==========================================
export const getThemes = () =>
  api.get('/stories/themes/');

export const startStory = (theme, language = 'english') =>
  api.post('/stories/start/', { theme, language });

export const continueStory = (choice, history, language, turn = 1) =>
  api.post('/stories/continue/', { choice, history, language, turn });

export const getGame = (type) =>
  api.post('/games/play/', { type });

// ==========================================
// Creative Endpoints
// ==========================================
export const getCreativeTypes = () =>
  api.get('/creative/types/');

export const getCreativeIdea = (type) =>
  api.post('/creative/idea/', { type });

export const shareCreation = (type, creation) =>
  api.post('/creative/share/', { creation });


// ==========================================
// Outdoor Endpoints
// ==========================================
export const getDailyActivity = () =>
  api.get('/outdoor/daily/');

export default api;