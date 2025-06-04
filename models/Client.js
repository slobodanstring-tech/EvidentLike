const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  date: { type: String, required: true }, // ISO datum (npr. "2025-06-04")
  name: { type: String, required: true },
  time: { type: String, required: true },
  note: { type: String, default: '' },
  completed: { type: Boolean, default: false },
});

module.exports = mongoose.model('Client', clientSchema);