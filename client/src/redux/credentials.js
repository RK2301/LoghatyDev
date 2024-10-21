import decode from "jwt-decode";
import axios from "axios";
import { authURl } from "./config";

let isRequestNewToken = false;
//save all request wait for the token to be refreshed
let tokenQueue = [];

export default class Credentials {

  
  getCredentials = async () => {
    const token = this.getToken();
    if (!!token && !this.isTokenExpired(token)) {
      return token;
    } else {
      const token = await this.setToken();
      return token;
    }
  };

  // Makes a token call to API and fetches new token and saves in localstorage
  setToken = async () => {

    if (isRequestNewToken) {
      return new Promise( (resolve, reject)  => {
        tokenQueue.push( {resolve, reject} );
      })
    }

    //the request in progress
    isRequestNewToken = true;
    const body = {
      username: sessionStorage.getItem('username'),
      password: sessionStorage.getItem('password'),
    };
    const config = {
      headers: {
        "Content-Type": "application/json",
        
      },
    };

    try {
      // const instance = axios.create();
      // const response = await instance.request({
      //   method: 'post',
      //   url: authURl + 'login',
      //   data: JSON.stringify(body),
      //   headers: config.headers,
      //   validateStatus: null
      // });

      const response = await fetch(authURl + 'login', {
        method: 'post',
        body: JSON.stringify(body),
        headers:{
          "Content-Type": "application/json"
        },
        credentials: 'same-origin'
      });
      const data = await response.json();

      sessionStorage.setItem("token", data.token);
      isRequestNewToken = false;

      //wake all the request waiting for the token
      tokenQueue.forEach( request => request.resolve(data.token) );
      return data.token;

    } catch (e) {
      isRequestNewToken = false;
      tokenQueue.forEach( request => request.resolve('') );
      return '';
    } finally{
      tokenQueue = [];
    }
  };

  getToken = () => {
    return sessionStorage.getItem("token"); // Fetches token from sessionStorage
  };

  //checks for token expiry
  isTokenExpired = token => {
    try {
      const decoded = decode(token);
      // console.log("decoded", decoded);
      if (decoded.exp < (Date.now() / 1000)) {
        // Checking if token is expired.
        return true;
      } else return false;
    } catch (err) {
      return false;
    }
  };
}