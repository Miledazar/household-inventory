import axios from 'axios';

const apiClient = axios.create({
    baseURL:  'https://localhost:7261/api',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

export default apiClient;