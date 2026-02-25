const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Non autorisé.' });
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide.' });
  }
}

// Créer un feedback
router.post('/', async (req, res) => {
  try {
    const { name, email, rating, message } = req.body;
    if (!name || !email || !rating || !message) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
    }
    const feedback = new Feedback({ name, email, rating, message });
    await feedback.save();
    res.status(201).json({ message: 'Merci pour votre avis !' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Récupérer les feedbacks (public - pour afficher sur le site)
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(20);
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Supprimer un feedback (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback supprimé.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;