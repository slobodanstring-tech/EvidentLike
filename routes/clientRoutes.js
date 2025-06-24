const express = require('express');
const router = express.Router();
const Client = require('../models/Client');

// Ruta za dohvatanje jedinstvenih klijenata
router.get('/unique', async (req, res) => {
  try {
    const clients = await Client.find()
      .select('name phone email gender birthday address allergy note createdAt')
      .sort({ name: 1 })
      .lean();
    const uniqueClients = Array.from(
      new Map(clients.map(client => [client._id, client])).values()
    );
    res.json(uniqueClients);
  } catch (err) {
    console.error('Greška pri dohvatanju jedinstvenih klijenata:', err);
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
        gender: client.gender,
        birthday: client.birthday,
        address: client.address,
        allergy: client.allergy,
        note: client.note,
        date: client.date,
        time: client.time,
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
    const {
      name,
      phone,
      email,
      gender,
      birthday,
      address,
      allergy,
      note,
      date,
      time,
      completed,
    } = req.body;

    // Validacija
    if (!name) {
      return res.status(400).json({ message: 'Ime i prezime su obavezni' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Nevažeći email format' });
    }
    if (phone && !/^\+?[\d\s-]{9,}$/.test(phone)) {
      return res.status(400).json({ message: 'Nevažeći telefon format' });
    }
    if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      return res.status(400).json({ message: 'Nevažeći format rođendana' });
    }
    if (gender && !['male', 'female'].includes(gender)) {
      return res.status(400).json({ message: 'Nevažeći pol, mora biti "male" ili "female"' });
    }

    const client = new Client({
      name,
      phone: phone || null,
      email: email || null,
      gender: gender || null,
      birthday: birthday || null,
      address: address || null,
      allergy: allergy || null,
      note: note || null,
      date,
      time,
      completed: completed || false,
    });

    const savedClient = await client.save();
    res.status(201).json({
      id: savedClient._id,
      name: savedClient.name,
      phone: savedClient.phone,
      email: savedClient.email,
      gender: savedClient.gender,
      birthday: savedClient.birthday,
      address: savedClient.address,
      allergy: savedClient.allergy,
      note: savedClient.note,
      date: savedClient.date,
      time: savedClient.time,
      completed: savedClient.completed,
      createdAt: savedClient.createdAt,
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
      gender: savedClient.gender,
      birthday: savedClient.birthday,
      address: savedClient.address,
      allergy: savedClient.allergy,
      note: savedClient.note,
      date: savedClient.date,
      time: savedClient.time,
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
    client.completed = req.body.completed;
    const updatedClient = await client.save();
    res.status(200).json({
      id: updatedClient._id,
      name: updatedClient.name,
      phone: updatedClient.phone,
      email: updatedClient.email,
      gender: updatedClient.gender,
      birthday: updatedClient.birthday,
      address: updatedClient.address,
      allergy: updatedClient.allergy,
      note: updatedClient.note,
      date: updatedClient.date,
      time: updatedClient.time,
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
    const {
      date,
      name,
      time,
      note,
      completed,
      phone,
      email,
      gender,
      birthday,
      address,
      allergy,
    } = req.body;
    if (!name || !date || !time) {
      return res.status(400).json({ message: 'Ime, datum i vreme su obavezni' });
    }
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Klijent nije pronađen' });
    }
    client.name = name;
    client.phone = phone || null;
    client.email = email || null;
    client.gender = gender || null;
    client.birthday = birthday || null;
    client.address = address || null;
    client.allergy = allergy || null;
    client.note = note || null;
    client.date = date;
    client.time = time;
    client.completed = completed;
    const updatedClient = await client.save();
    res.status(200).json({
      id: updatedClient._id,
      name: updatedClient.name,
      phone: updatedClient.phone,
      email: updatedClient.email,
      gender: updatedClient.gender,
      birthday: updatedClient.birthday,
      address: updatedClient.address,
      allergy: updatedClient.allergy,
      note: updatedClient.note,
      date: updatedClient.date,
      time: updatedClient.time,
      completed: updatedClient.completed,
    });
  } catch (error) {
    console.error('Greška pri ažuriranju klijenta:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;