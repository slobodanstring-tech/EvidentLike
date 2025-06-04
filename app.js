const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const clientRoutes = require('./routes/clientRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Parsiranje JSON tela zahteva
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

// Postavljanje EJS-a
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rute
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/clients', (req, res) => {
  res.render('clients');
});

app.use('/api/clients', clientRoutes);

// Povezivanje sa MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Povezan sa MongoDB'))
  .catch((err) => console.error('Greška pri povezivanju sa MongoDB:', err));

// Pokretanje servera
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server pokrenut na http://localhost:${port}`);
});