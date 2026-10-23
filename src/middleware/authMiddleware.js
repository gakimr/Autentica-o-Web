const { db } = require("../database");
const { hashToken, safeEqual } = require("../utils/tokens");

function requireAuth(requiredRole = null) {
  return (req, res, next) => {
    const token = req.cookies?.session_id;
    if (!token) return res.status(401).json({ error: "Faça login para continuar" });

    const session = db.prepare(`
      SELECT s.token_hash, s.csrf_token, s.expires_at,
             u.id AS user_id, u.email, u.role
      FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?
    `).get(hashToken(token));

    if (!session || new Date(session.expires_at) < new Date()) {
      if (session) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(session.token_hash);
      res.clearCookie("session_id");
      return res.status(401).json({ error: "Sessão inválida ou expirada" });
    }

    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      const csrf = req.get("X-CSRF-Token") || "";
      if (!safeEqual(csrf, session.csrf_token)) {
        return res.status(403).json({ error: "Token CSRF inválido" });
      }
    }

    if (requiredRole && session.role !== requiredRole) {
      return res.status(403).json({ error: "Você não tem permissão para acessar este recurso" });
    }

    req.user = session;
    next();
  };
}

module.exports = { requireAuth };
