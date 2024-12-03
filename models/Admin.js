// models/Utilizador.js
const mongoose = require("mongoose");
// <!-- Identificacao identidade externa,nome entidade,especializacao,descrição entidade,password -->

const adminSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
