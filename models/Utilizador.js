// models/Utilizador.js
const mongoose = require('mongoose');

const utilizadorSchema = new mongoose.Schema({
  pseudonimo: {
    type: String,
    required: [true, 'Pseudonimo is required'],
    unique: true,
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'Age must be at least 18']
  },
  idDocument: {
    data: Buffer,
    contentType: {
      type: String,
      required: [true, 'Content type is required']
    },
    hash: {
      type: String,
      required: [true, 'Public key is required'],
      unique: true
    },
  },
  publicKey: {
    type: String,
    required: [true, 'Public key is required'],
    trim: true
  }
});

const Utilizador = mongoose.model('Utilizador', utilizadorSchema);
module.exports = Utilizador;