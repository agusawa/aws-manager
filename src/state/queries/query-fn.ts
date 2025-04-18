import axios, { AxiosResponse } from 'axios';

export const QueryFn = axios.create({
  timeout: 30 * 1000, // 30 seconds
});

QueryFn.interceptors.request.use(
  (config) => config,
  (error) => {
    return Promise.reject(error);
  }
);

QueryFn.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    return Promise.reject(error);
  }
);
