/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { createProxyMiddleware } = require("http-proxy-middleware");

const proxy = createProxyMiddleware({
  target: "http://localhost:9000",
  changeOrigin: true,
});

module.exports = function (app) {
  app.use("/api", proxy);
  app.use("/auth", proxy);
  app.use("/socket.io", proxy);
};
