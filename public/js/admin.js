let token = localStorage.getItem('davshop_token');
let orders = [];

// Vérifier si déjà connecté
if (token) showDashboard();

async function adminLogin(e) {
  e.preventDefault();
  const password = document.getElementById('adminPassword').value;
  const alertDiv = document.getElementById('loginAlert');

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data = await res.json();

    if (res.ok) {
      token = data.token;
      localStorage.setItem('davshop_token', token);
      showDashboard();
    } else {
      alertDiv.innerHTML = `<div class="alert alert-error">${data.error}</div>`;
    }
  } catch (err) {
    alertDiv.innerHTML = `<div class="alert alert-error">Erreur de connexion.</div>`;
  }
}

function showDashboard() {
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('adminDashboard').classList.add('show');
  document.getElementById('logoutBtn').style.display = 'inline';
  loadOrders();
}

function logout() {
  localStorage.removeItem('davshop_token');
  location.reload();
}

async function loadOrders() {
  try {
    const res = await fetch('/api/admin/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 401) {
      logout();
      return;
    }

    orders = await res.json();
    renderStats();
    renderOrders();
  } catch (err) {
    console.error('Erreur:', err);
  }
}

function renderStats() {
  const stats = {
    total: orders.length,
    recu: orders.filter(o => o.status === 'Demande reçue').length,
    enCours: orders.filter(o => ['Commande passée', 'En livraison', 'Arrive bientôt'].includes(o.status)).length,
    livre: orders.filter(o => o.status === 'Livré').length
  };

  document.getElementById('adminStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-number">${stats.total}</div>
      <div class="stat-label">Total commandes</div>
    </div>
    <div class="stat-card">
      <div class="stat-number" style="color: var(--lime);">${stats.recu}</div>
      <div class="stat-label">Nouvelles demandes</div>
    </div>
    <div class="stat-card">
      <div class="stat-number" style="color: #F97316;">${stats.enCours}</div>
      <div class="stat-label">En cours</div>
    </div>
    <div class="stat-card">
      <div class="stat-number" style="color: #22C55E;">${stats.livre}</div>
      <div class="stat-label">Livrées</div>
    </div>
  `;
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

function renderOrders() {
  const tbody = document.getElementById('ordersBody');

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color: var(--gray);">Aucune commande pour le moment.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td><strong style="color: var(--lime);">${order.trackingId}</strong></td>
      <td>
        <strong>${order.name}</strong><br>
        <span style="color: var(--gray); font-size: 0.8rem;">${order.phone}</span>
      </td>
      <td style="max-width: 200px;">
        <span style="font-size: 0.85rem;">${order.productDescription.substring(0, 50)}${order.productDescription.length > 50 ? '...' : ''}</span>
      </td>
      <td style="color: var(--gray); font-size: 0.85rem;">${new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
      <td><span class="status-badge ${getStatusClass(order.status)}">${order.status}</span></td>
      <td>
        <button class="action-btn edit" onclick="editOrder('${order._id}')">✏️</button>
        <button class="action-btn delete" onclick="deleteOrder('${order._id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function editOrder(id) {
  const order = orders.find(o => o._id === id);
  if (!order) return;

  document.getElementById('editId').value = order._id;
  document.getElementById('editName').value = order.name;
  document.getElementById('editEmail').value = order.email;
  document.getElementById('editPhone').value = order.phone;
  document.getElementById('editLink').value = order.productLink;
  document.getElementById('editDescription').value = order.productDescription;
  document.getElementById('editAddress').value = order.address;
  document.getElementById('editStatus').value = order.status;
  document.getElementById('editNotes').value = order.adminNotes || '';

  document.getElementById('editModal').classList.add('show');
}

function closeModal() {
  document.getElementById('editModal').classList.remove('show');
}

async function saveOrder() {
  const id = document.getElementById('editId').value;
  const status = document.getElementById('editStatus').value;
  const adminNotes = document.getElementById('editNotes').value;

  try {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, adminNotes })
    });

    if (res.ok) {
      closeModal();
      loadOrders();
    }
  } catch (err) {
    console.error('Erreur:', err);
  }
}

async function deleteOrder(id) {
  if (!confirm('Supprimer cette commande ?')) return;

  try {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) loadOrders();
  } catch (err) {
    console.error('Erreur:', err);
  }
}

// Fermer modal en cliquant dehors
document.getElementById('editModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('editModal')) closeModal();
});