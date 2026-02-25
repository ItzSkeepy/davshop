const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Créer une commande
router.post('/', async (req, res) => {
  try {
    console.log('📥 Données reçues:', req.body);

    const { name, email, phone, productLink, productDescription, quantity, address, message } = req.body;

    if (!name || !email || !phone || !productLink || !productDescription || !address) {
      return res.status(400).json({ error: 'Veuillez remplir tous les champs obligatoires.' });
    }

    const order = new Order({
      name, email, phone, productLink, productDescription,
      quantity: quantity || 1, address, message
    });

    console.log('💾 Tentative de sauvegarde...');
    await order.save();
    console.log('✅ Commande sauvegardée:', order.trackingId);

    res.status(201).json({
      message: 'Demande envoyée avec succès !',
      trackingId: order.trackingId
    });
  } catch (err) {
    console.log('❌ ERREUR DÉTAILLÉE:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Suivre une commande
router.get('/track/:trackingId', async (req, res) => {
  try {
    const order = await Order.findOne({ trackingId: req.params.trackingId.toUpperCase() });
    if (!order) {
      return res.status(404).json({ error: 'Commande introuvable.' });
    }
    res.json({
      trackingId: order.trackingId,
      status: order.status,
      productDescription: order.productDescription,
      quantity: order.quantity,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;