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
    default: null,
  },
  email: {
    type: String,
    trim: true,
    default: null,
  },
  gender: {
    type: String,
    enum: ['male', 'female', null],
    default: null,
  },
  birthday: {
    type: String, // Čuvamo kao "YYYY-MM-DD"
    trim: true,
    default: null,
  },
  address: {
    type: String,
    trim: true,
    default: null,
  },
  allergy: {
    type: String,
    trim: true,
    default: null,
  },
  note: {
    type: String,
    trim: true,
    default: null,
  },
  date: {
    type: String, // ISO format "YYYY-MM-DD"
    required: true,
  },
  time: {
    type: String, // Format "HH:mm"
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Client', clientSchema);