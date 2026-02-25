const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.GMAIL_PASSWORD
  }
});

// Notifier l'admin d'une nouvelle commande
async function notifyAdminNewOrder(order) {
  try {
    await transporter.sendMail({
      from: `"DavShop" <${process.env.ADMIN_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🛒 Nouvelle commande - ${order.trackingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6C63FF, #FF6584); padding: 25px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🛒 Nouvelle Commande</h1>
          </div>
          <div style="padding: 30px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; color: #aaa;">📋 Code</td>
                <td style="padding: 10px; font-weight: bold;">${order.trackingId}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #aaa;">👤 Client</td>
                <td style="padding: 10px;">${order.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #aaa;">📧 Email</td>
                <td style="padding: 10px;">${order.email}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #aaa;">📱 Téléphone</td>
                <td style="padding: 10px;">${order.phone}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #aaa;">📦 Produit</td>
                <td style="padding: 10px;">${order.productDescription}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #aaa;">🔗 Lien</td>
                <td style="padding: 10px;"><a href="${order.productLink}" style="color: #6C63FF;">Voir le produit</a></td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #aaa;">🔢 Quantité</td>
                <td style="padding: 10px;">${order.quantity}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #aaa;">📍 Adresse</td>
                <td style="padding: 10px;">${order.address}</td>
              </tr>
              ${order.message ? `<tr>
                <td style="padding: 10px; color: #aaa;">💬 Message</td>
                <td style="padding: 10px;">${order.message}</td>
              </tr>` : ''}
            </table>
          </div>
        </div>
      `
    });
    console.log('✅ Email admin envoyé');
  } catch (err) {
    console.log('❌ Erreur email admin:', err.message);
  }
}

// Confirmer la commande au client
async function notifyClientOrderConfirmed(order) {
  try {
    await transporter.sendMail({
      from: `"DavShop" <${process.env.ADMIN_EMAIL}>`,
      to: order.email,
      subject: `✅ Commande reçue - ${order.trackingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6C63FF, #FF6584); padding: 25px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">✅ Commande Confirmée</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px;">Bonjour <strong>${order.name}</strong>,</p>
            <p style="color: #ccc;">Nous avons bien reçu votre demande d'achat. Voici les détails :</p>
            
            <div style="background: #16213e; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 8px 0;"><span style="color: #aaa;">📋 Code de suivi :</span> <strong style="color: #6C63FF; font-size: 18px;">${order.trackingId}</strong></p>
              <p style="margin: 8px 0;"><span style="color: #aaa;">📦 Produit :</span> ${order.productDescription}</p>
              <p style="margin: 8px 0;"><span style="color: #aaa;">🔢 Quantité :</span> ${order.quantity}</p>
              <p style="margin: 8px 0;"><span style="color: #aaa;">📍 Adresse :</span> ${order.address}</p>
            </div>

            <p style="color: #ccc;">Conservez votre code de suivi <strong style="color: #6C63FF;">${order.trackingId}</strong> pour suivre l'avancement de votre commande sur notre site.</p>
            
            <p style="color: #ccc;">Vous recevrez un email à chaque mise à jour du statut de votre commande.</p>
            
            <p style="margin-top: 30px; color: #ccc;">Merci pour votre confiance ! 🙏</p>
            <p style="color: #6C63FF; font-weight: bold;">L'équipe DavShop</p>
          </div>
        </div>
      `
    });
    console.log('✅ Email confirmation client envoyé à', order.email);
  } catch (err) {
    console.log('❌ Erreur email client:', err.message);
  }
}

// Notifier le client d'un changement de statut
async function notifyClientStatusUpdate(order) {
  const statusInfo = {
    'Demande reçue': { emoji: '📋', color: '#6C63FF', message: 'Votre demande a été reçue et est en cours de traitement.' },
    'Commande passée': { emoji: '✅', color: '#4CAF50', message: 'Votre commande a été passée auprès du fournisseur.' },
    'En livraison': { emoji: '🚚', color: '#FF9800', message: 'Votre colis est en route !' },
    'Arrive bientôt': { emoji: '📍', color: '#2196F3', message: 'Votre colis arrive bientôt à destination.' },
    'Livré': { emoji: '🎉', color: '#4CAF50', message: 'Votre colis a été livré ! Merci pour votre achat.' }
  };

  const info = statusInfo[order.status] || { emoji: '📦', color: '#6C63FF', message: '' };

  try {
    await transporter.sendMail({
      from: `"DavShop" <${process.env.ADMIN_EMAIL}>`,
      to: order.email,
      subject: `${info.emoji} Mise à jour - ${order.trackingId} : ${order.status}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, ${info.color}, #FF6584); padding: 25px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${info.emoji} Mise à jour de commande</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px;">Bonjour <strong>${order.name}</strong>,</p>
            
            <div style="background: #16213e; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="color: #aaa; margin: 0 0 10px;">Commande <strong style="color: #6C63FF;">${order.trackingId}</strong></p>
              <p style="font-size: 28px; margin: 10px 0;">${info.emoji}</p>
              <p style="font-size: 20px; font-weight: bold; color: ${info.color}; margin: 10px 0;">${order.status}</p>
              <p style="color: #ccc; margin: 10px 0;">${info.message}</p>
            </div>

            <div style="background: #16213e; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 8px 0;"><span style="color: #aaa;">📦 Produit :</span> ${order.productDescription}</p>
              <p style="margin: 8px 0;"><span style="color: #aaa;">🔢 Quantité :</span> ${order.quantity}</p>
              ${order.adminNotes ? `<p style="margin: 8px 0;"><span style="color: #aaa;">💬 Note :</span> ${order.adminNotes}</p>` : ''}
            </div>
            
            <p style="margin-top: 30px; color: #ccc;">Merci pour votre confiance ! 🙏</p>
            <p style="color: #6C63FF; font-weight: bold;">L'équipe DavShop</p>
          </div>
        </div>
      `
    });
    console.log('✅ Email statut envoyé à', order.email);
  } catch (err) {
    console.log('❌ Erreur email statut:', err.message);
  }
}

module.exports = { notifyAdminNewOrder, notifyClientOrderConfirmed, notifyClientStatusUpdate };