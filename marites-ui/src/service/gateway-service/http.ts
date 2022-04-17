import axios from "axios";

const gatewayUrl = process.env.API_GATEWAY_URL ?? "";

const instance = axios.create({
  baseURL: gatewayUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
