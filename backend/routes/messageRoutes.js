const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');

// Route pour envoyer un message
router.post('/send', async (req, res) => {
    const { sender, recipient, content, room, type } = req.body;

    if (!sender || !content || !type) {
        return res.status(400).send({ error: 'Les champs sender, content et type sont obligatoires.' });
    }

    if (type === 'private' && !recipient) {
        return res.status(400).send({ error: 'Le champ recipient est obligatoire pour un message privé.' });
    }

    if (type === 'channel' && !room) {
        return res.status(400).send({ error: 'Le champ room est obligatoire pour un message de canal.' });
    }

    try {
        const user = await User.findOne({ username: sender });
        if (!user) {
            return res.status(404).send({ error: 'Utilisateur introuvable.' });
        }

        if (type === 'channel' && (!user.channels.includes(room))) {
            return res.status(403).send({ error: 'Vous n’êtes pas membre de ce canal.' });
        }

        const message = new Message({ sender, recipient, content, room, type });
        await message.save();

        res.status(201).send({ message: 'Message envoyé', message });
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de l’envoi du message', details: err.message });
    }
});

// Route pour récupérer les messages d'un canal
router.get('/channel/:channel', async (req, res) => {
    const { channel } = req.params;

    try {
        const messages = await Message.find({ room: channel }).sort({ createdAt: 1 }); // Trie par date croissante
        res.status(200).send(messages);
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la récupération des messages', details: err.message });
    }
});

router.get('/private/:sender/:recipient', async (req, res) => {
    const { sender, recipient } = req.params;

    try {
        const messages = await Message.find({
            type: 'private',
            $or: [
                { sender, recipient },
                { sender: recipient, recipient: sender },
            ],
        }).sort({ createdAt: 1 });
        res.status(200).send(messages);
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la récupération des messages privés', details: err.message });
    }
});

module.exports = router;