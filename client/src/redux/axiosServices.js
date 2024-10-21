 import axios from "axios"; 
 import Credentials from "./credentials";

 const credentials = new Credentials(); // Gets access to all credentials functions
 const isRequestNewToken = false;
 //save all request wait for the token to be refreshed
 const tokenQueue = [];
 const axiosInstance = axios.create();

 axiosInstance.interceptors.request.use ( 
    async config => {
      const token = await credentials.getCredentials(isRequestNewToken, tokenQueue);  // Gets credentials from localStorage
      if (token) config.headers.Authorization = `${token}`; // Inserts credentials as bearer token in request headers

        config.headers['Accept-Language'] = sessionStorage.getItem('lan');
        return config;
      },
      error => {
        return Promise.reject(error);
      }
 )

export default axiosInstance;
