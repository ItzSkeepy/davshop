const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const { notifyAdminNewOrder, notifyClientOrderConfirmed, notifyClientStatusUpdate } = require('../utils/mailer');

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

// Créer une commande
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, productLink, productDescription, quantity, address, message } = req.body;

    if (!name || !email || !phone || !productLink || !productDescription || !address) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis.' });
    }

    const order = Order.createOrder({ name, email, phone, productLink, productDescription, quantity, address, message });

    console.log('✅ Commande sauvegardée:', order.trackingId);

    notifyAdminNewOrder(order);
    notifyClientOrderConfirmed(order);

    res.status(201).json({
      message: 'Demande envoyée avec succès !',
      trackingId: order.trackingId
    });
  } catch (err) {
    console.log('❌ ERREUR:', err);
    res.status(500).json({ error: 'Erreur lors de la création de la commande.' });
  }
});

// Suivre une commande
router.get('/track/:trackingId', async (req, res) => {
  try {
    const order = Order.findByTrackingId(req.params.trackingId);
    if (!order) return res.status(404).json({ error: 'Commande non trouvée.' });
    res.json({
      trackingId: order.trackingId,
      status: order.status,
      productDescription: order.productDescription,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      adminNotes: order.adminNotes
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Admin - Lister les commandes
router.get('/admin/all', auth, async (req, res) => {
  try {
    const orders = Order.findAll();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Admin - Modifier statut
router.put('/admin/:id', auth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const order = Order.findByIdAndUpdate(req.params.id, { status, adminNotes });

    if (!order) return res.status(404).json({ error: 'Commande non trouvée.' });

    notifyClientStatusUpdate(order);

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Admin - Supprimer
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Commande supprimée.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;