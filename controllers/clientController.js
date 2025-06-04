const Client = require('../models/Client');

// Dohvati sve klijente
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find();
    const clientData = {};
    clients.forEach((client) => {
      if (!clientData[client.date]) clientData[client.date] = [];
      clientData[client.date].push({
        name: client.name,
        time: client.time,
        note: client.note,
        completed: client.completed,
        id: client._id.toString(), // Dodaj ID za identifikaciju
      });
    });
    res.json(clientData);
  } catch (err) {
    res.status(500).json({ error: 'Greška pri dohvatanju klijenata' });
  }
};

// Dodaj novog klijenta
exports.createClient = async (req, res) => {
  try {
    const { date, name, time, note } = req.body;
    if (!date || !name || !time) {
      return res.status(400).json({ error: 'Nedostaju obavezni podaci' });
    }
    const client = new Client({ date, name, time, note, completed: false });
    await client.save();
    res.status(201).json({
      id: client._id,
      date,
      name,
      time,
      note,
      completed: client.completed,
    });
  } catch (err) {
    res.status(500).json({ error: 'Greška pri dodavanju klijenta' });
  }
};

// Ažuriraj klijenta
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, name, time, note, completed } = req.body;
    if (!date || !name || !time) {
      return res.status(400).json({ error: 'Nedostaju obavezni podaci' });
    }
    const client = await Client.findByIdAndUpdate(
      id,
      { date, name, time, note, completed },
      { new: true }
    );
    if (!client) {
      return res.status(404).json({ error: 'Klijent nije pronađen' });
    }
    res.json({
      id: client._id,
      date: client.date,
      name: client.name,
      time: client.time,
      note: client.note,
      completed: client.completed,
    });
  } catch (err) {
    res.status(500).json({ error: 'Greška pri ažuriranju klijenta' });
  }
};

// Obriši klijenta
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByIdAndDelete(id);
    if (!client) {
      return res.status(404).json({ error: 'Klijent nije pronađen' });
    }
    res.json({ message: 'Klijent obrisan' });
  } catch (err) {
    res.status(500).json({ error: 'Greška pri brisanju klijenta' });
  }
};

// Označi klijenta kao završenog
exports.toggleClientCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ error: 'Klijent nije pronađen' });
    }
    client.completed = !client.completed;
    await client.save();
    res.json({
      id: client._id,
      date: client.date,
      name: client.name,
      time: client.time,
      note: client.note,
      completed: client.completed,
    });
  } catch (err) {
    res.status(500).json({ error: 'Greška pri označavanju klijenta' });
  }
};