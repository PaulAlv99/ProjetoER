// models/Utilizador.js
const mongoose = require("mongoose");

const utilizadorSchema = new mongoose.Schema({
  pseudonimo: {
    type: String,
    required: [true, "Pseudonimo is required"],
    unique: true,
    trim: true,
  },
  age: {
    type: Number,
    required: [true, "Age is required"],
    min: [18, "Age must be at least 18"],
  },
  docDocumento: {
    data: Buffer,
    contentType: {
      type: String,
      required: [true, "Content type is required"],
    },
    hash: {
      type: String,
      required: [true, "Public key is required"],
      unique: true,
    },
  },
  publicKey: {
    type: String,
    required: [true, "Public key is required"],
    trim: true,
  },
  estado: {
    type: String,
    enum: ["ativo", "inativo", "suspenso"],
    default: "ativo",
  },
  itens: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
});

const Utilizador = mongoose.model("Utilizador", utilizadorSchema);
module.exports = Utilizador;
