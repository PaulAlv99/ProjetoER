// models/Utilizador.js
const mongoose = require("mongoose");
const { Number } = require("mongoose/lib/schema/index");
// <!-- Identificacao identidade externa,nome entidade,especializacao,descrição entidade,password -->

const itemSchema = new mongoose.Schema({
  idUtilizador: {
    type: String,
    required: true,
    unique: true,
  },

  categoria: {
    type: String,
    required: true,
    unique: true,
  },
  descricao: {
    type: String,
    required: true,
  },
  peso: {
    type: Number,
    required: true,
  },
  localizacao: {
    type: String,
    required: true,
  },
  fotos: [
    {
      data: Buffer,
      contentType: {
        type: String,
        required: true,
      },
    },
  ],
});

const Item = mongoose.model("Item", itemSchema);
module.exports = Item;
