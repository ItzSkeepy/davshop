function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('active');
}

async function trackOrder() {
  const code = document.getElementById('trackInput').value.trim().toUpperCase();
  const alertDiv = document.getElementById('trackAlert');
  const resultDiv = document.getElementById('trackResult');

  if (!code) {
    alertDiv.innerHTML = `<div class="alert alert-error">Veuillez entrer un code de suivi.</div>`;
    resultDiv.classList.remove('show');
    return;
  }

  try {
    const res = await fetch(`/api/orders/track/${code}`);
    const data = await res.json();

    if (res.ok) {
      alertDiv.innerHTML = '';
      resultDiv.classList.add('show');

      document.getElementById('resultTracking').textContent = data.trackingId;
      document.getElementById('resultProduct').textContent = data.productDescription;
      document.getElementById('resultQuantity').textContent = data.quantity;
      document.getElementById('resultDate').textContent = new Date(data.createdAt).toLocaleDateString('fr-FR');

      // Badge
      const badge = document.getElementById('resultBadge');
      badge.textContent = data.status;
      badge.className = 'status-badge ' + getStatusClass(data.status);

      // Timeline
      const statuses = ['Demande reçue', 'Commande passée', 'En livraison', 'Arrive bientôt', 'Livré'];
      const currentIndex = statuses.indexOf(data.status);
      const steps = document.querySelectorAll('.timeline-step');

      steps.forEach((step, i) => {
        step.classList.remove('done', 'active');
        if (i < currentIndex) step.classList.add('done');
        if (i === currentIndex) step.classList.add('active');
      });

    } else {
      alertDiv.innerHTML = `<div class="alert alert-error">${data.error}</div>`;
      resultDiv.classList.remove('show');
    }
  } catch (err) {
    alertDiv.innerHTML = `<div class="alert alert-error">Erreur de connexion au serveur.</div>`;
    resultDiv.classList.remove('show');
  }
}

function getStatusClass(status) {
  const map = {
    'Demande reçue': 'recu',
    'Commande passée': 'passe',
    'En livraison': 'livraison',
    'Arrive bientôt': 'bientot',
    'Livré': 'livre'
  };
  return map[status] || '';
}

// Recherche avec Enter
document.getElementById('trackInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') trackOrder();
});