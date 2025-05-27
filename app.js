const express = require('express');
const app = express();
const path = require('path');

// Postavljanje view engine-a
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Povezivanje public foldera za CSS i JS
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

// Glavna ruta
app.get('/', (req, res) => {
  res.render('index');
});

// Ruta za listu klijenata
app.get('/clients', (req, res) => {
  res.render('clients');
});

// Pokretanje servera
const port = 3000;
app.listen(port, () => {
  console.log(`Server pokrenut na http://localhost:${port}`);
});