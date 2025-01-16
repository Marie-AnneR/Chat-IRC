const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const User = require('../models/User');

// Route pour créer un canal
router.post('/create', async (req, res) => {
    const { name, createdBy } = req.body;
    if (!name || !createdBy) {
        return res.status(400).send({ error: 'Les champs name et createdBy sont obligatoires.' });
    }

    try {
        const existingRoom = await Room.findOne({ name });
        if (existingRoom) {
            return res.status(400).send({ error: 'Le canal existe déjà.' });
        }

        const room = new Room({ name, createdBy });
        await room.save();

        res.status(201).send({ message: 'Canal créé avec succès', room });
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la création du canal', details: err.message });
    }
});

router.get('/list', async (req, res) => {
  const { search } = req.query; 
  try {
      const query = search ? { name: { $regex: search, $options: 'i' } } : {};
      const rooms = await Room.find(query);
      res.status(200).send(rooms);
  } catch (err) {
      res.status(500).send({ error: 'Erreur lors de la récupération des canaux', details: err.message });
  }
});

// supprimer un canal par nom
router.delete('/delete/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const room = await Room.findOneAndDelete({ name });
        if (!room) {
            return res.status(404).send({ error: 'Canal introuvable.' });
        }

        res.status(200).send({ message: `Canal '${name}' supprimé avec succès` });
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la suppression du canal', details: err.message });
    }
});

//récupérer les détails d'un canal par nom
router.get('/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const room = await Room.findOne({ name });
        if (!room) {
            return res.status(404).send({ error: 'Canal introuvable.' });
        }

        res.status(200).send(room);
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la récupération du canal', details: err.message });
    }
});

router.post('/join', async (req, res) => {
  const { username, channel } = req.body;

  console.log('Données reçues :', { username, channel });

  if (!username || !channel) {
      return res.status(400).send({ error: 'Les champs username et channel sont obligatoires.' });
  }

  try {
      const room = await Room.findOne({ name: channel });
      console.log('Canal trouvé :', room);

      if (!room) {
          return res.status(404).send({ error: 'Canal introuvable.' });
      }

      const user = await User.findOne({ username });
      console.log('Utilisateur trouvé :', user);

      if (!user) {
          return res.status(404).send({ error: 'Utilisateur introuvable.' });
      }

      if (!user.channels.includes(channel)) {
          user.channels.push(channel);
          await user.save();
      }

      res.status(200).send({ message: `Utilisateur ajouté au canal ${channel}` });
  } catch (err) {
      console.error('Erreur :', err.message);
      res.status(500).send({ error: 'Erreur lors de l’ajout au canal', details: err.message });
  }
});


router.post('/quit', async (req, res) => {
  const { username, channel } = req.body;

  if (!username || !channel) {
      return res.status(400).send({ error: 'Les champs username et channel sont obligatoires.' });
  }

  try {
      const user = await User.findOne({ username });
      if (!user || !user.channels.includes(channel)) {
          return res.status(404).send({ error: 'Utilisateur ou canal introuvable.' });
      }

      user.channels = user.channels.filter((ch) => ch !== channel);
      await user.save();

      res.status(200).send({ message: `Utilisateur retiré du canal ${channel}` });
  } catch (err) {
      res.status(500).send({ error: 'Erreur lors du retrait du canal', details: err.message });
  }
});

module.exports = router;