import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
};

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(
      /\/api\/?$/,
      ""
    );
  }

  return "http://localhost:5000";
};

export const getChatSocket = () => {
  if (!socket) {
    socket = io(getSocketUrl(), {
      autoConnect: false,

      auth: {
        token: getToken(),
      },

      transports: ["websocket", "polling"],
    });
  }

  return socket;
};

export const connectChatSocket = () => {
  const chatSocket = getChatSocket();

  chatSocket.auth = {
    token: getToken(),
  };

  if (!chatSocket.connected) {
    chatSocket.connect();
  }

  return chatSocket;
};

export const disconnectChatSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};