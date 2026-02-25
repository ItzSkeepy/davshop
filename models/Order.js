const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    unique: true
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  productLink: { type: String, required: true },
  productDescription: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  address: { type: String, required: true },
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Demande reçue', 'Commande passée', 'En livraison', 'Arrive bientôt', 'Livré'],
    default: 'Demande reçue'
  },
  adminNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Générer un ID de suivi unique avant de sauvegarder
orderSchema.pre('save', async function() {
  if (!this.trackingId) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'DAV-';
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.trackingId = id;
  }
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Order', orderSchema);