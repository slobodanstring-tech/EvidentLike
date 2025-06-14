// models/customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: '',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Customer', customerSchema);