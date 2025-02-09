const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { SECURE_STORAGE_PATH, getFullPath } = require("./controllers/anuncio");

const {
  registoUser,
  loginUser,
  sair,
  autenticarToken,
  autenticarTokenEntidade,
  autenticarTokenLocalidade,
  registoEntidade,
  loginEntidade,
  registoLocalidade,
  loginLocalidade,
} = require("./controllers/auth");
const { gerarChavesHandler } = require("./controllers/gerarChaves");
const { informacaoTransacaoUtilizador } = require("./controllers/buscaId");
const { anunciarItem } = require("./controllers/anuncio");

const cors = require("cors");
const { pesquisarItens } = require("./controllers/pesquisa");

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URL, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Middleware

app.set("view engine", "ejs");
app.use(express.static("src/public"));
app.use("/secure_uploads", express.static("secure_uploads"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: ["http://192.168.1.14:3000", "http://127.0.0.1:3000"],
  })
);

//
app.get("/", autenticarToken, (req, res) => {
  res.render("paginaInicial");
});

app.get("/pesquisa", autenticarToken, (req, res) => {
  res.render("pesquisaForm");
});

app.get("/anuncio", autenticarToken, (req, res) => {
  res.render("anuncioItensForm");
});

app.get("/resultadosPesquisa", autenticarToken, (req, res) => {
  res.render("resultadosPesquisa");
});

app.get("/pesquisa", autenticarToken, (req, res) => {
  res.render("pesquisaForm");
});

app.get("/perfil", autenticarToken, (req, res) => {
  res.render("perfilUtilizador");
});

app.get("/perfil/transacoes", autenticarToken, (req, res) => {
  res.render("perfilTransacoes");
});

app.get("/perfil/itens", autenticarToken, (req, res) => {
  res.render("perfilItens");
});

app.get("/perfil/notificacoes", autenticarToken, (req, res) => {
  res.render("perfilNotificacoes");
});

app.get("/perfil/reviews", autenticarToken, (req, res) => {
  res.render("perfilReviews");
});

// Public routes
app.get("/gerarchaves", (req, res) => {
  res.render("gerarChaves");
});

app.get("/registo", (req, res) => {
  res.render("registoForm");
});

app.get("/login", (req, res) => {
  res.render("loginForm");
});

app.get("/login-entidade", (req, res) => {
  res.render("loginEntidade");
});

app.get("/registo-entidade", (req, res) => {
  res.render("registoEntidade");
});

app.get("/entidade/dashboard", autenticarTokenEntidade, (req, res) => {
  res.render("dashboardEntidade");
});

app.get("/localidade/dashboard", autenticarTokenLocalidade, (req, res) => {
  res.render("dashboardLocalidade");
});
app.get("/registo-localidade", (req, res) => {
  res.render("registoLocalidade");
});

app.get("/login-localidade", (req, res) => {
  res.render("loginLocalidade");
});
app.get("/admin/dashboard", (req, res) => {
  res.render("dashboardAdmin");
});

app.get("/item/:id", autenticarToken, async (req, res) => {
  try {
    const itemId = req.params.id;

    // Simulação de busca do item no banco de dados
    const item = await mongoose.model("Item").findById(itemId);

    if (!item) {
      return res
        .status(404)
        .render("erro", { mensagem: "Item não encontrado." });
    }

    res.render("detalhesItem", { item });
  } catch (error) {
    console.error("Erro ao buscar item:", error);
    res
      .status(500)
      .render("erro", { mensagem: "Erro ao buscar os detalhes do item." });
  }
});
// Secure file serving endpoint
app.get("/file/:filepath(*)", autenticarToken, async (req, res) => {
  try {
    // Sanitize and validate filepath
    const requestedPath = req.params.filepath;
    const normalizedPath = path
      .normalize(requestedPath)
      .replace(/^(\.\.[\/\\])+/, "");
    const fullPath = getFullPath(normalizedPath);

    // Verify file exists
    try {
      await fs.access(fullPath);
    } catch {
      return res.status(404).send("Arquivo não encontrado");
    }

    // Verify file is within secure storage
    const relativePath = path.relative(SECURE_STORAGE_PATH, fullPath);
    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      return res.status(403).send("Acesso negado");
    }

    // Set security headers
    res.set({
      "Content-Security-Policy": "default-src 'self'",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    });

    // Stream file
    res.sendFile(fullPath);
  } catch (error) {
    console.error("Erro ao servir arquivo:", error);
    res.status(500).send("Erro interno do servidor");
  }
});

// Auth rotas
app.post("/gerarchaves", gerarChavesHandler);
app.post("/registo", registoUser);
app.post("/login", loginUser);
app.get("/sair", sair);
app.post("/anuncio", anunciarItem);
app.post("/pesquisa", pesquisarItens);
app.post("/registo-entidade", registoEntidade);
app.post("/login-entidade", loginEntidade);
app.post("/registo-localidade", registoLocalidade);
app.post("/login-localidade", loginLocalidade);
app.post("/perfil/transacoes", informacaoTransacaoUtilizador);
app.post("/perfil/transacoes", informacaoTransacaoUtilizador);

const httpsServer = https.createServer(
  {
    key: fs.readFileSync(
      path.join(__dirname, "certificates", "privateKeyServer.pem")
    ),
    cert: fs.readFileSync(
      path.join(__dirname, "certificates", "certificateSSL.pem")
    ),
  },
  app
);
// httpsServer.listen(3000, () => {
//   console.log("HTTPS server up and running on port 3000");
// });
app.listen(port, "localhost", () => {
  console.log(`Server running on port ${port}`);
});
