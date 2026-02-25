// Toggle menu mobile
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('active');
}

// Formulaire de commande
document.getElementById('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const alertDiv = document.getElementById('formAlert');

  const data = {
    name: form.name.value,
    email: form.email.value,
    phone: form.phone.value,
    productLink: form.productLink.value,
    productDescription: form.productDescription.value,
    quantity: parseInt(form.quantity.value),
    address: form.address.value,
    message: form.message.value
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
      document.getElementById('orderFormContainer').style.display = 'none';
      document.getElementById('successMessage').classList.add('show');
      document.getElementById('trackingCode').textContent = result.trackingId;
    } else {
      alertDiv.innerHTML = `<div class="alert alert-error">${result.error}</div>`;
    }
  } catch (err) {
    alertDiv.innerHTML = `<div class="alert alert-error">Erreur de connexion au serveur.</div>`;
  }
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});