const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  idUtilizador: {
    type: String,
    required: true,
    index: true
  },
  categoria: {
    type: String,
    required: true,
    index: true
  },
  nome: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  peso: {
    type: Number,
    required: true,
    min: 0,
    max: 999
  },
  localizacao: {
    type: String,
    required: true,
    index: true
  },
  fotos: [{
    path: {
      type: String,
      required: true
    },
    contentType: {
      type: String,
      required: true,
    }
  }],
  dataCriacao: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['ativo', 'inativo', 'removido'],
    default: 'ativo',
    index: true
  }
});

// Pre-save middleware to ensure minimum photos
itemSchema.pre('save', function(next) {
  if (this.fotos.length < 5) {
    next(new Error('Minimum of 5 photos required'));
  }
  next();
});

const Item = mongoose.model("Item", itemSchema);
module.exports = Item;