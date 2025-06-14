// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');

// Dohvati sve klijente
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    console.error('Greška pri dohvatanju klijenata:', err);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// Kreiraj novog klijenta
router.post('/', async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    if (!full_name) {
      return res.status(400).json({ message: 'Ime je obavezno' });
    }
    const customer = new Customer({ full_name, phone });
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    console.error('Greška pri kreiranju klijenta:', err);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;