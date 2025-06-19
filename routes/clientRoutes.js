const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
// Ruta za dohvatanje jedinstvenih klijenata
router.get('/unique', async (req, res) => {
  try {
    const clients = await Client.find()
      .select('name phone createdAt')
      .sort({ name: 1 }) // Sortiranje po imenu u rastućem redosledu
      .lean();
    const uniqueClients = Array.from(
      new Map(clients.map(client => [client.phone || client.name, client])).values()
    );
    res.json(uniqueClients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET svih klijenata
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
    const groupedClients = clients.reduce((acc, client) => {
      const isoDate = client.date;
      if (!acc[isoDate]) acc[isoDate] = [];
      acc[isoDate].push({
        id: client._id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        date: client.date,
        time: client.time,
        note: client.note,
        completed: client.completed,
      });
      return acc;
    }, {});
    res.json(groupedClients);
  } catch (error) {
    console.error('Greška pri dohvatanju klijenata:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// POST novog klijenta iz #newClientModal
router.post('/new', async (req, res) => {
  try {
    const { name, phone, email, date, time, note, completed } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Ime i prezime su obavezni' });
    }
    const client = new Client({ name, phone, email, date, time, note, completed });
    const savedClient = await client.save();
    res.status(201).json({
      id: savedClient._id,
      name: savedClient.name,
      phone: savedClient.phone,
      email: savedClient.email,
      date: savedClient.date,
      time: savedClient.time,
      note: savedClient.note,
      completed: savedClient.completed,
    });
  } catch (error) {
    console.error('Greška pri čuvanju klijenta:', error);
    res.status(400).json({ message: error.message });
  }
});

// POST klijenta iz #dayModal
router.post('/', async (req, res) => {
  try {
    const { date, name, time, note } = req.body;
    if (!name || !date || !time) {
      return res.status(400).json({ message: 'Ime, datum i vreme su obavezni' });
    }
    const client = new Client({ name, date, time, note });
    const savedClient = await client.save();
    res.status(201).json({
      id: savedClient._id,
      name: savedClient.name,
      phone: savedClient.phone,
      email: savedClient.email,
      date: savedClient.date,
      time: savedClient.time,
      note: savedClient.note,
      completed: savedClient.completed,
    });
  } catch (error) {
    console.error('Greška pri čuvanju klijenta:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE klijenta
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Klijent nije pronađen' });
    }
    res.status(200).json({ message: 'Klijent obrisan' });
  } catch (error) {
    console.error('Greška pri brisanju klijenta:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// PATCH za označavanje kao završeno
router.patch('/:id/complete', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Klijent nije pronađen' });
    }
    client.completed = !client.completed;
    const updatedClient = await client.save();
    res.status(200).json({
      id: updatedClient._id,
      name: updatedClient.name,
      phone: updatedClient.phone,
      email: updatedClient.email,
      date: updatedClient.date,
      time: updatedClient.time,
      note: updatedClient.note,
      completed: updatedClient.completed,
    });
  } catch (error) {
    console.error('Greška pri označavanju klijenta:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// PUT za ažuriranje klijenta
router.put('/:id', async (req, res) => {
  try {
    const { date, name, time, note, completed } = req.body;
    if (!name || !date || !time) {
      return res.status(400).json({ message: 'Ime, datum i vreme su obavezni' });
    }
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Klijent nije pronađen' });
    }
    client.name = name;
    client.date = date;
    client.time = time;
    client.note = note;
    client.completed = completed;
    const updatedClient = await client.save();
    res.status(200).json({
      id: updatedClient._id,
      name: updatedClient.name,
      phone: updatedClient.phone,
      email: updatedClient.email,
      date: updatedClient.date,
      time: updatedClient.time,
      note: updatedClient.note,
      completed: updatedClient.completed,
    });
  } catch (error) {
    console.error('Greška pri ažuriranju klijenta:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;