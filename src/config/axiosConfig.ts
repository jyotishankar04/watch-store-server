import axios from "axios";

const postalApi = axios.create({
  baseURL: "https://api.postalpincode.in/",
  headers: {
    "Content-Type": "application/json",
  },
});

export { postalApi };
