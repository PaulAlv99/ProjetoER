// models/Utilizador.js
const mongoose = require("mongoose");

const localidadeSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    unique: true,
  },
  localizacao: {
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
  estado: {
    type: String,
    enum: ["ativo", "expulso", "suspenso"],
    default: "suspenso",
  },
  password: {
    type: String,
    required: true,
  },
});

const Localidade = mongoose.model("Utilizador", localidadeSchema);
module.exports = Localidade;
