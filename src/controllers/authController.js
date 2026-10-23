const argon2 = require("argon2");
const { db } = require("../database");
const { hashToken, randomToken } = require("../utils/tokens");

const SESSION_MINUTES = Number(process.env.SESSION_TTL_MINUTES || 30);
const dummyHashPromise = argon2.hash("senha-falsa-para-comparacao");

async function register(req, res) {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!email.includes("@") || password.length < 8) {
    return res.status(400).json({ error: "Informe um e-mail válido e uma senha com pelo menos 8 caracteres" });
  }

  try {
    const passwordHash = await argon2.hash(password);
    db.prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'cliente')")
      .run(email, passwordHash);
    return res.status(201).json({ message: "Cadastro realizado com sucesso" });
  } catch (err) {
    if (String(err.code || "").startsWith("SQLITE_CONSTRAINT")) {
      return res.status(409).json({ error: "Não foi possível cadastrar com esses dados" });
    }
    throw err;
  }
}

async function login(req, res) {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  const dummyHash = await dummyHashPromise;
  const passwordOk = await argon2.verify(user ? user.password_hash : dummyHash, password);
  if (!user || !passwordOk) {
    return res.status(401).json({ error: "E-mail ou senha inválidos" });
  }

  if (argon2.needsRehash(user.password_hash)) {
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?")
      .run(await argon2.hash(password), user.id);
  }

  const token = randomToken();
  const csrfToken = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_MINUTES * 60 * 1000).toISOString();

  db.prepare("INSERT INTO sessions (token_hash, user_id, csrf_token, expires_at) VALUES (?, ?, ?, ?)")
    .run(hashToken(token), user.id, csrfToken, expiresAt);

  res.cookie("session_id", token, {
    httpOnly: true,
    secure: String(process.env.COOKIE_SECURE).toLowerCase() === "true",
    sameSite: "lax",
    maxAge: SESSION_MINUTES * 60 * 1000
  });

  return res.json({ message: "Login realizado com sucesso", role: user.role, csrf_token: csrfToken });
}

function logout(req, res) {
  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(req.user.token_hash);
  res.clearCookie("session_id", {
    httpOnly: true,
    secure: String(process.env.COOKIE_SECURE).toLowerCase() === "true",
    sameSite: "lax"
  });
  return res.json({ message: "Logout realizado com sucesso" });
}

module.exports = { register, login, logout };
