const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Connexion à la base de données dans le dossier serveur/
const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'), (err) => {
  if (err) {
    console.error("❌ Erreur de base :", err.message);
  } else {
    console.log("📂 Base CatMail connectée avec ronron");
  }
});

// Création des tables
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS mails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT NOT NULL,
    recipient TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL
  )
`);

// Route d'envoi de message
app.post('/send', (req, res) => {
  const { sender, recipient, subject, message } = req.body;
  const timestamp = new Date().toISOString();

  if (!sender || !recipient || !message) {
    return res.status(400).json({ error: "Champs manquants 😿" });
  }

  db.run(
    `INSERT INTO mails (sender, recipient, subject, message, timestamp) VALUES (?, ?, ?, ?, ?)`,
    [sender, recipient, subject || '', message, timestamp],
    (err) => {
      if (err) {
        console.error('❌ Erreur enregistrement :', err.message);
        return res.status(500).json({ error: "Échec de l'envoi 🐾" });
      }
      res.json({ success: true, message: "CatMail envoyé avec ronron 🎉" });
    }
  );
});

// Route de consultation de boîte de réception
app.get('/inbox/:user', (req, res) => {
  const user = req.params.user;

  db.all(
    `SELECT * FROM mails WHERE recipient = ? ORDER BY timestamp DESC`,
    (err, rows) => {
      if (err) {
        console.error("❌ Erreur récupération inbox :", err.message);
        return res.status(500).json({
          success: false,
          error: "Impossible d'afficher les CatMails 😿"
        });
      }

      res.status(200).json({
        success: true,
        inbox: rows
      });
    }
  );
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🐾 Serveur CatMail opérationnel sur http://localhost:${PORT}`);
});
