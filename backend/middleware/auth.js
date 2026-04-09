const jwt = require("jsonwebtoken");

const AUTH_COOKIE_NAME = "accessToken";

function getJwtSecret() {
  return process.env.JWT_SECRET || "dev-only-change-me";
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function buildAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: isProduction() ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

function readTokenFromRequest(req) {
  const tokenFromCookie = req.cookies?.[AUTH_COOKIE_NAME];
  if (tokenFromCookie) return tokenFromCookie;

  const authorizationHeader = req.headers.authorization;
  if (authorizationHeader?.startsWith("Bearer ")) {
    return authorizationHeader.slice(7);
  }

  return "";
}

function authMiddleware(req, res, next) {
  const token = readTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function signUserToken(userId) {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: "7d" });
}

module.exports = {
  AUTH_COOKIE_NAME,
  authMiddleware,
  buildAuthCookieOptions,
  getJwtSecret,
  signUserToken,
};
