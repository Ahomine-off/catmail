const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client'))); // Sert les fichiers HTML/CSS/JS

const db = new sqlite3.Database('./db.sqlite', (err) => {
  if (err) console.error('🐾 Erreur DB:', err.message);
  else console.log('📂 Base CatMail connectée');
});

// Table des CatMails
db.run(`
  CREATE TABLE IF NOT EXISTS mails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    recipient TEXT,
    subject TEXT,
    message TEXT,
    timestamp TEXT
  )
`);

// Table des utilisateurs félins
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`);


app.post('/send', (req, res) => {
  const { sender, recipient, subject, message } = req.body;
  const timestamp = new Date().toISOString();

  if (!sender || !recipient || !message) {
    return res.status(400).json({ error: "Champs manquants 😿" });
  }

  db.run(`INSERT INTO mails (sender, recipient, subject, message, timestamp)
          VALUES (?, ?, ?, ?, ?)`,
          [sender, recipient, subject || '', message, timestamp],
          err => {
            if (err) {
              console.error('Erreur envoi :', err.message);
              return res.status(500).json({ error: "Échec de l'envoi 🐾💥" });
            }
            res.json({ success: true, message: "CatMail envoyé 🐱📬" });
          });
});

app.get('/inbox/:user', (req, res) => {
  const user = req.params.user;
  db.all(`SELECT * FROM mails WHERE recipient = ? ORDER BY timestamp DESC`,
  (err, rows) => {
    if (err) {
      console.error("Erreur dans la récupération de l'inbox 😿:", err.message);
      return res.status(500).json({
        success: false,
        error: "Impossible d'afficher la boîte féline pour cet utilisateur"
      });
    }

    res.status(200).json({
      success: true,
      inbox: rows
    });
  });
});

// 🚀 Démarrage du serveur CatMail
app.listen(PORT, () => {
  console.log(`🐾 Serveur CatMail opérationnel sur http://localhost:${PORT}`);
});
