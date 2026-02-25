const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

router.get('/', (req, res) => {
  try {
    const feedbacks = Feedback.findAll();
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, email, rating, message } = req.body;

    if (!name || !email || !rating || !message) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
    }

    const feedback = Feedback.createFeedback({ name, email, rating, message });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;