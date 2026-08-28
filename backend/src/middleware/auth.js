import jwt from "jsonwebtoken";

export const SESSION_COOKIE = "alertaurbana_session";

function getToken(req) {
  const cookie = req.headers.cookie
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${SESSION_COOKIE}=`));

  if (cookie) return decodeURIComponent(cookie.slice(SESSION_COOKIE.length + 1));

  const authHeader = req.headers.authorization;
  return authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
}

// Verifica el header "Authorization: Bearer <token>" y agrega req.user = { id, role }.
// Úsalo en cualquier ruta que solo deba poder usar un usuario autenticado.
export function verifyToken(req, res, next) {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "No autorizado" });
    }
    next();
  };
}
