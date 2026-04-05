const { createProxyMiddleware } = require("http-proxy-middleware");

/**
 * CRA dev server: forward /api → backend.
 * Express strips the mount path, so the proxy sees req.url like "/auth/register" while
 * the API expects "/api/auth/register" — pathRewrite adds the /api prefix back.
 */
module.exports = function setupProxy(app) {
  const target = process.env.REACT_APP_PROXY_TARGET || "http://127.0.0.1:3000";
  app.use(
    "/api",
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: (path) => (path.startsWith("/api") ? path : `/api${path}`),
    })
  );
};
