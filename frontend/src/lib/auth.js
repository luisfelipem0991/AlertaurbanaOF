import jwt from "jsonwebtoken";

export const SESSION_COOKIE = "alertaurbana_session";

export const ROLE_HOME = {
  USER: "/huecos",
  JAC: "/huecos/jac",
  ALCALDIA: "/huecos/alcaldia",
  ADMIN: "/admin",
  SUPERADMIN: "/admin",
};

export function getHomeForRole(role) {
  return ROLE_HOME[role] || "/login";
}

export function verifySessionToken(token) {
  if (!token || !process.env.JWT_SECRET) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return { id: payload.id, role: payload.role };
  } catch {
    return null;
  }
}

export function requireRole(request, allowedRoles) {
  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    return { error: Response.json({ error: "No autenticado" }, { status: 401 }) };
  }

  if (!allowedRoles.includes(session.role)) {
    return { error: Response.json({ error: "No autorizado" }, { status: 403 }) };
  }

  return { session };
}
