const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true }, // L'utilisateur qui envoie le message
    recipient: { type: String, required: false }, // Optionnel pour les messages de canal
    content: { type: String, required: true }, // Le contenu du message
    room: { type: String, required: false }, // Optionnel pour les messages privés
    type: { type: String, enum: ['private', 'channel'], required: true }, // Type de message : privé ou canal
    createdAt: { type: Date, default: Date.now }, // Date d'envoi du message
});

// Export du modèle Message
module.exports = mongoose.model('Message', messageSchema);