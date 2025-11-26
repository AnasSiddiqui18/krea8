import axios_def from "axios";

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL;

export const axios = axios_def.create({
  baseURL,
});
