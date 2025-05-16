const express = require('express');
const cors = require('cors');
const chrono = require('chrono-node');

const app = express();
app.use(cors());
app.use(express.json());

const appointments = [];

// 🧠 Pretvaranje pisanih brojeva u cifre
function replaceWrittenNumbers(text) {
  const map = {
    'jedan': '1', 'dva': '2', 'tri': '3', 'četiri': '4', 'pet': '5',
    'šest': '6', 'sedam': '7', 'osam': '8', 'devet': '9', 'deset': '10',
    'jedanaest': '11', 'dvanaest': '12'
  };
  for (const [word, digit] of Object.entries(map)) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    text = text.replace(regex, digit);
  }
  return text;
}

// 📅 Srpski meseci → engleski
function convertSerbianMonthsToEnglish(text) {
  const months = {
    'januar': 'January', 'februar': 'February', 'mart': 'March', 'april': 'April',
    'maj': 'May', 'jun': 'June', 'jul': 'July', 'avgust': 'August',
    'septembar': 'September', 'oktobar': 'October', 'novembar': 'November', 'decembar': 'December'
  };
  for (const [sr, en] of Object.entries(months)) {
    const regex = new RegExp(`\\b${sr}\\b`, 'gi');
    text = text.replace(regex, en);
  }
  return text;
}

// 🧾 POST /parse-appointment
app.post('/parse-appointment', (req, res) => {
  const { sentence } = req.body;
  console.log('▶️ STIGLO:', sentence);

  // 🔁 Dozvoli i prezime sa malim slovom
  const nameMatch = sentence.match(/[A-ZŠĐČĆŽ][a-zšđčćž]+ [a-zA-ZŠĐČĆŽ][a-zšđčćž]+/);

  const preCleaned = convertSerbianMonthsToEnglish(sentence);
  const preProcessed = replaceWrittenNumbers(preCleaned);

  // 🧹 Ukloni ime pre parsiranja datuma/vremena
  let withoutName = preProcessed;
  if (nameMatch) {
    withoutName = preProcessed.replace(nameMatch[0], '');
  }

  const cleanedSentence = withoutName
    .replace(/h\.?|časova?|ujutru|popodne/gi, '')
    .trim();

  console.log('🧹 Počišćena rečenica:', cleanedSentence);

  const parsed = chrono.parse(cleanedSentence)[0];

  if (!parsed) {
    console.log('⛔ chrono nije uspeo da parsira.');
    return res.status(400).json({ error: 'Nije prepoznat datum ili vreme.' });
  }

  const date = parsed.start.date();

  if (date.getFullYear() === 1970) {
    date.setFullYear(new Date().getFullYear());
  }

  if (!parsed.start.isCertain('hour')) {
    date.setHours(10);
    date.setMinutes(0);
  }

  console.log('📆 DATUM:', date);
  console.log('👤 IME:', nameMatch ? nameMatch[0] : 'Nepoznat');

  // Formatiraj u lokalni string bez UTC
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const localDateString = `${y}-${m}-${d}T${h}:${min}`;

  const appointment = {
    patientName: nameMatch ? nameMatch[0] : 'Nepoznat',
    appointmentDate: localDateString
  };

  appointments.push(appointment);
  res.json(appointment);
});

// 📤 GET /appointments
app.get('/appointments', (req, res) => {
  res.json(appointments);
});

app.listen(3000, () => {
  console.log('✅ Backend radi na http://localhost:3000');
});
