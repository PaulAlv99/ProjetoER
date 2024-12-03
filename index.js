const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const {
  registo,
  login,
  sair,
  autenticarToken,
  registoEntidade,
  loginEntidade,
} = require("./controllers/auth");
const { gerarChavesHandler } = require("./controllers/gerarChaves");
const { informacaoTransacaoUtilizador } = require("./controllers/buscaId");

const cors = require("cors");

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://admin:vFp5rkxFODUGGGH7@cluster0.nka2m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {}
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Middleware

app.set("view engine", "ejs");
app.use(express.static("src/public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: ["http://192.168.1.14:3000", "http://127.0.0.1:3000"],
  })
);

// Public routes
app.get("/", autenticarToken, (req, res) => {
  res.render("paginaInicial");
});

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
  res.render("loginEntidadeForm");
});

app.get("/registo-entidade", (req, res) => {
  res.render("registoEntidadeForm");
});

app.get("/pesquisa", (req, res) => {
  res.render("pesquisaForm");
});

app.get("/anuncio", (req, res) => {
  res.render("anuncioItensForm");
});

app.get("/perfil", (req, res) => {
  res.render("perfilUtilizador");
});

app.get("/perfil/transacoes", (req, res) => {
  res.render("perfilTransacoes");
});

app.get("/perfil/itens", (req, res) => {
  res.render("perfilItens");
});

app.get("/perfil/notificacoes", (req, res) => {
  res.render("perfilNotificacoes");
});

app.get("/perfil/reviews", (req, res) => {
  res.render("perfilReviews");
});

// Auth rotas
// API endpoint to generate keys
app.post("/gerarchaves", gerarChavesHandler);
app.post("/registo", registo);
app.post("/login", login);
app.get("/sair", sair);
app.post("/registo-entidade", registoEntidade);
app.post("/login-entidade", loginEntidade);
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
httpsServer.listen(3000, "127.0.0.1", () => {
  console.log("HTTPS server up and running on port 3000");
});
// app.listen(port,"192.168.1.14",() => {
//   console.log(`Server running on port ${port}`);
// });
