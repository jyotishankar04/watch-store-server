import axios from "axios";
import { Config } from "./config";

const postalApi = axios.create({
  baseURL: "https://api.postalpincode.in/",
  headers: {
    "Content-Type": "application/json",
  },
});
const phonePeApi = axios.create({
  baseURL: Config.PHONE_TESTING_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export { postalApi, phonePeApi };
