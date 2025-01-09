const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
});

module.exports = mongoose.model('Room', roomSchema);