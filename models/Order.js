const fs = require('fs');
const path = require('path');

const ordersFile = path.join(__dirname, '..', 'data', 'orders.json');
const counterFile = path.join(__dirname, '..', 'data', 'counter.json');

function readOrders() {
  const data = fs.readFileSync(ordersFile, 'utf8');
  return JSON.parse(data);
}

function writeOrders(orders) {
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
}

function generateTrackingId() {
  const counter = JSON.parse(fs.readFileSync(counterFile, 'utf8'));
  counter.count += 1;
  fs.writeFileSync(counterFile, JSON.stringify(counter));
  return 'DAV-' + String(counter.count).padStart(4, '0');
}

function createOrder(data) {
  const orders = readOrders();
  const order = {
    id: Date.now().toString(),
    trackingId: generateTrackingId(),
    name: data.name,
    email: data.email,
    phone: data.phone,
    productLink: data.productLink,
    productDescription: data.productDescription,
    quantity: data.quantity || 1,
    address: data.address,
    message: data.message || '',
    status: 'Demande reçue',
    adminNotes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  orders.push(order);
  writeOrders(orders);
  return order;
}

function findByTrackingId(trackingId) {
  const orders = readOrders();
  return orders.find(o => o.trackingId === trackingId.toUpperCase()) || null;
}

function findAll() {
  const orders = readOrders();
  return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function findByIdAndUpdate(id, updates) {
  const orders = readOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return null;
  orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
  writeOrders(orders);
  return orders[index];
}

function findByIdAndDelete(id) {
  const orders = readOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return null;
  const deleted = orders.splice(index, 1)[0];
  writeOrders(orders);
  return deleted;
}

module.exports = { createOrder, findByTrackingId, findAll, findByIdAndUpdate, findByIdAndDelete };