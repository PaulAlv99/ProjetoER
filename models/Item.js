// models/Utilizador.js
const mongoose = require("mongoose");
// <!-- Identificacao identidade externa,nome entidade,especializacao,descrição entidade,password -->

const itemSchema = new mongoose.Schema({
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
    type: Float64Array,
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
