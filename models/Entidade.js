// models/Utilizador.js
const mongoose = require("mongoose");
// <!-- Identificacao identidade externa,nome entidade,especializacao,descrição entidade,password -->

const entidadeSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, "É necessário um nome"],
    unique: true,
  },
  especializacao: {
    type: String,
    required: true,
  },
  docIdentidade: {
    data: Buffer,
    contentType: {
      type: String,
      required: true,
    },
  },
  descricao: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  estado: {
    type: String,
    enum: ["ativo", "expulso", "suspenso"],
    default: "suspenso",
  },
});

const Entidade = mongoose.model("Entidade", entidadeSchema);
module.exports = Entidade;
