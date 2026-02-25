const fs = require('fs');
const path = require('path');

const feedbacksFile = path.join(__dirname, '..', 'data', 'feedbacks.json');

function readFeedbacks() {
  const data = fs.readFileSync(feedbacksFile, 'utf8');
  return JSON.parse(data);
}

function writeFeedbacks(feedbacks) {
  fs.writeFileSync(feedbacksFile, JSON.stringify(feedbacks, null, 2));
}

function createFeedback(data) {
  const feedbacks = readFeedbacks();
  const feedback = {
    id: Date.now().toString(),
    name: data.name,
    email: data.email,
    rating: data.rating,
    message: data.message,
    createdAt: new Date().toISOString()
  };
  feedbacks.push(feedback);
  writeFeedbacks(feedbacks);
  return feedback;
}

function findAll() {
  const feedbacks = readFeedbacks();
  return feedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = { createFeedback, findAll };