// models/Utilizador.js
const mongoose = require("mongoose");

const utilizadorSchema = new mongoose.Schema(
  {
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
    docIdentificacao: {
      data: Buffer,
      contentType: {
        type: String,
        required: [true, "Content type is required"],
      },
      hash: {
        type: String,
      },
    },
    publicKey: {
      type: String,
      required: [true, "Public key is required"],
    },
    estado: {
      type: String,
      enum: ["ativo", "inativo", "suspenso"],
      default: "ativo",
    },
    itens: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
  },
  { collection: "utilizadores" }
);

const Utilizador = mongoose.model("Utilizador", utilizadorSchema);
module.exports = Utilizador;
