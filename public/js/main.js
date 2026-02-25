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

// ===== FEEDBACK =====

// Étoiles
let selectedRating = 0;
document.querySelectorAll('#starRating span').forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.dataset.star);
    document.getElementById('fbRatingInput').value = selectedRating;
    document.querySelectorAll('#starRating span').forEach((s, i) => {
      s.textContent = i < selectedRating ? '★' : '☆';
      s.style.color = i < selectedRating ? '#FFD700' : 'var(--gray)';
    });
  });

  star.addEventListener('mouseenter', () => {
    const val = parseInt(star.dataset.star);
    document.querySelectorAll('#starRating span').forEach((s, i) => {
      s.textContent = i < val ? '★' : '☆';
      s.style.color = i < val ? '#FFD700' : 'var(--gray)';
    });
  });
});

document.getElementById('starRating').addEventListener('mouseleave', () => {
  document.querySelectorAll('#starRating span').forEach((s, i) => {
    s.textContent = i < selectedRating ? '★' : '☆';
    s.style.color = i < selectedRating ? '#FFD700' : 'var(--gray)';
  });
});

// Charger les feedbacks
async function loadFeedbacks() {
  try {
    const res = await fetch('/api/feedback');
    const feedbacks = await res.json();
    const container = document.getElementById('feedbackList');

    if (feedbacks.length === 0) {
      container.innerHTML = '<p style="text-align:center; color: var(--gray);">Aucun avis pour le moment. Soyez le premier !</p>';
      return;
    }

    container.innerHTML = feedbacks.map(fb => `
      <div class="feedback-card">
        <div class="feedback-header">
          <div>
            <span class="feedback-name">${fb.name}</span>
            <span class="feedback-date"> — ${new Date(fb.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
          <div class="feedback-stars">${'★'.repeat(fb.rating)}${'☆'.repeat(5 - fb.rating)}</div>
        </div>
        <p class="feedback-text">${fb.message}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Erreur feedbacks:', err);
  }
}

loadFeedbacks();

// Envoyer feedback
document.getElementById('feedbackForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const alertDiv = document.getElementById('feedbackAlert');

  if (!selectedRating) {
    alertDiv.innerHTML = '<div class="alert alert-error">Veuillez donner une note.</div>';
    return;
  }

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.fbName.value,
        email: form.fbEmail.value,
        rating: selectedRating,
        message: form.fbMessage.value
      })
    });

    const data = await res.json();

    if (res.ok) {
      alertDiv.innerHTML = '<div class="alert alert-success">✅ Merci pour votre avis !</div>';
      form.reset();
      selectedRating = 0;
      document.querySelectorAll('#starRating span').forEach(s => {
        s.textContent = '☆';
        s.style.color = 'var(--gray)';
      });
      loadFeedbacks();
    } else {
      alertDiv.innerHTML = `<div class="alert alert-error">${data.error}</div>`;
    }
  } catch (err) {
    alertDiv.innerHTML = '<div class="alert alert-error">Erreur de connexion.</div>';
  }
});