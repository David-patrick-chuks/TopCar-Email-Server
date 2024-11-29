const mongoose = require('mongoose');

// Client schema definition
const clientSchema = new mongoose.Schema({
  email: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  message: { type: String, required: true },
  messageType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  followUpSent: { type: Boolean, default: false }, // Tracks whether follow-up has been sent
  lastFollowUp: { type: Date, default: null }, // To store the date when the last follow-up was sent
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
