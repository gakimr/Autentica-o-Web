require("dotenv").config();
const path = require("node:path");
const express = require("express");
const cookieParser = require("cookie-parser");
const { initDatabase } = require("./src/database");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

async function start() {
  await initDatabase();
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, "public")));

  app.use("/auth", authRoutes);
  app.use("/users", userRoutes);
  app.use("/admin", adminRoutes);

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  });

  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`Servidor em http://localhost:${port}`));
}

start().catch((err) => {
  console.error("Erro ao iniciar a aplicação:", err);
  process.exit(1);
});
