const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-]{9,}$/, 'Unesite važeći broj telefona'],
  },
  email: {
    type: String,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Unesite važeću e-mail adresu'],
  },
  date: {
    type: String, // ISO datum, npr. "2025-06-13"
    default: () => new Date().toISOString().split('T')[0],
  },
  time: {
    type: String,
    default: '00:00',
  },
  note: {
    type: String,
    trim: true,
    default: '',
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Client', clientSchema);