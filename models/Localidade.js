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
  password: {
    type: String,
    required: true,
  },
  estado: {
    type: String,
    enum: ["pendente", "aprovado", "rejeitado", "banido", "suspenso"],
    default: "pendente",
  },
  dataCriacao: {
    type: Date,
    default: Date.now,
  },
});

const Localidade = mongoose.model("Localidade", localidadeSchema);
module.exports = Localidade;
