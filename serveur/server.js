const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 📂 Connexion à la base SQLite
const db = new sqlite3.Database('./db.sqlite', (err) => {
  if (err) console.error('Erreur féline 🐾:', err.message);
  else console.log('Base CatMail connectée avec ronron');
});

// 🐾 Création de la table mails (si non existante)
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

// 📬 Route pour envoyer un message
app.post('/send', (req, res) => {
  const { sender, recipient, subject, message } = req.body;
  const timestamp = new Date().toISOString();

  if (!sender || !recipient || !message) {
    return res.status(400).json({ error: 'Champs obligatoires manquants 😿' });
  }

  db.run(
    `INSERT INTO mails (sender, recipient, subject, message, timestamp)
     VALUES (?, ?, ?, ?, ?)`,
    [sender, recipient, subject || '', message, timestamp],
    (err) => {
      if (err) {
        console.error('Erreur miaulante :', err.message);
        return res.status(500).json({ error: 'Échec de l’envoi 🐾💥' });
      }
      res.json({ success: true, message: 'CatMail envoyé 😺📬' });
    }
  );
});
// 📨 Route pour afficher les messages reçus par un utilisateur
app.get('/inbox/:user', (req, res) => {
  const user = req.params.user;

  db.all(
    `SELECT * FROM mails WHERE recipient = ? ORDER BY timestamp DESC`,
  (err, rows) => {
    if (err) {
      console.error("Erreur lors de la récupération des CatMails 📥😿:", err.message);
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

// 🐱 Démarrage du serveur CatMail
app.listen(PORT, () => {
  console.log(`🐾 Serveur CatMail opérationnel sur http://localhost:${PORT}`);
});
