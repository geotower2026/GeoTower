const mongoose = require('mongoose');

const motoristaSchema = new mongoose.Schema({
  transportadora: {
    type: String,
    required: true,
    trim: true
  },
  nome: {
    type: String,
    required: true,
    trim: true
  },
  cpf: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/ // CPF format: XXX.XXX.XXX-XX
  },
  vinculo: {
    type: String,
    enum: ['PRÓPRIO', 'AGREGADO', 'TERCEIRO'],
    required: true
  },
  rastreador: {
    type: String,
    trim: true,
    default: '-'
  },
  telefone: {
    type: String,
    required: true,
    trim: true,
    match: /^(\+?55)?\s*\(?[1-9]{2}\)?\s*9?\d{4}-?\d{4}$/ // Brazilian phone format
  },
  observacoes: {
    type: String,
    default: '',
    trim: true
  },
  ativo: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound unique index for transportadora + cpf
motoristaSchema.index({ transportadora: 1, cpf: 1 }, { unique: true });

motoristaSchema.methods.toJSON = function() {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model('Motorista', motoristaSchema);
