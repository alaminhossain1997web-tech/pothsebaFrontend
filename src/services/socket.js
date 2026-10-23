import { io } from "socket.io-client";
import { API_BASE_URL } from "./Api";

let sharedSocket;
let activeToken;

// Keep one Socket.IO client for the app and refresh its auth when the login
// token changes. Components should attach listeners to this shared instance.
export const getSharedSocket = () => {
  const token = localStorage.getItem("accessToken");

  if (!sharedSocket) {
    activeToken = token;
    sharedSocket = io(API_BASE_URL, {
      autoConnect: false,
      path: "/socket.io/",
      withCredentials: true,
      auth: token ? { token } : {},
    });
  } else if (token !== activeToken) {
    activeToken = token;
    sharedSocket.auth = token ? { token } : {};

    if (sharedSocket.connected) {
      sharedSocket.disconnect();
    }

  }

  return sharedSocket;
};

export const connectSharedSocket = (socket = sharedSocket) => {
  if (socket && activeToken && !socket.connected) {
    socket.connect();
  }
};
