const debug = require("debug")("app:/services/http");
const config = require("config");
const axios = require("axios");

// axios.defaults.baseURL = config.get("baseEndpoint");

// axios.interceptors.request.use((request) => {
//   if (config.get("debugApiCalls")) {
//     debug("Starting Request", request);
//     debug("End request");
//   }
//   return request;
// });

exports.get = axios.get;
exports.all = axios.all;
exports.post = axios.post;
exports.put = axios.put;
exports.delete = axios.delete;
