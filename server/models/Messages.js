const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversations' },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  message: { type: String, required: true },
  seen: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Messages', messageSchema);
