import { io } from "socket.io-client";
import api from "./api";

const SOCKET_URL =
  process.env.REACT_APP_API_URL || api.defaults.baseURL || "http://localhost:4000";

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }
  return socketInstance;
}
