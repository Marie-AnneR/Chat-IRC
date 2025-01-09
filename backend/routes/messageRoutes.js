const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Envoyer un message
router.post('/', async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtenir tous les messages d'un salon
router.get('/:roomId', async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId }).populate('user', 'username');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;