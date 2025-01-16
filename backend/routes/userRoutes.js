const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Route pour connecter un utilisateur
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('Requête reçue pour /login :', req.body);

    if (!email || !password) {
        console.log('Erreur : Champs email ou password manquants');
        return res.status(400).send({ error: 'Les champs email et password sont obligatoires.' });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        console.log('Utilisateur trouvé :', user);

        if (!user) {
            console.log('Erreur : Utilisateur introuvable');
            return res.status(404).send({ error: 'Utilisateur introuvable.' });
        }

        const isMatch = await user.comparePassword(password);
        console.log('Comparaison du mot de passe :', isMatch);

        if (!isMatch) {
            console.log('Erreur : Mot de passe incorrect');
            return res.status(401).send({ error: 'Mot de passe incorrect.' });
        }

        res.status(200).send({ message: 'Connexion réussie', user });
    } catch (err) {
        console.error('Erreur lors de la connexion :', err.message);
        res.status(500).send({ error: 'Erreur lors de la connexion', details: err.message });
    }
});




// Route pour connecter ou créer un utilisateur
router.post('/connect', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send({ error: 'Les champs username, email et password sont obligatoires.' });
    }

    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).send({ error: 'Un utilisateur avec cet email existe déjà.' });
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Mot de passe haché :', hashedPassword);

        const newUser = new User({
            username,
            email: email.toLowerCase(),
            password: hashedPassword, // Enregistre le mot de passe haché
        });
        await newUser.save();

        res.status(201).send({ message: 'Utilisateur créé avec succès', user: newUser });
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la création de l’utilisateur', details: err.message });
    }
});


//route pour changer le pseudo d'un user
router.post('/nick', async (req, res) => {
    const { oldUsername, newUsername } = req.body;

    if (!oldUsername || !newUsername) {
        return res.status(400).send({ error: 'Les champs oldUsername et newUsername sont obligatoires.' });
    }

    try {
        const user = await User.findOneAndUpdate(
            { username: oldUsername },
            { username: newUsername },
            { new: true }
        );

        if (user) {
            res.status(200).send({ message: 'Pseudonyme mis à jour', user });
        } else {
            res.status(404).send({ error: 'Utilisateur introuvable' });
        }
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la mise à jour', details: err.message });
    }
});

// Route pour ajouter un utilisateur à un canal
router.post('/add-to-channel', async (req, res) => {
    const { username, channel } = req.body;

    if (!username || !channel) {
        return res.status(400).send({ error: 'Les champs username et channel sont obligatoires.' });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send({ error: 'Utilisateur introuvable.' });
        }

        if (!user.channels.includes(channel)) {
            user.channels.push(channel);
            await user.save();
        }

        res.status(200).send({ message: `Utilisateur ajouté au canal ${channel}`, user });
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de l’ajout au canal', details: err.message });
    }
});

// Route pour récupérer les utilisateurs d’un canal
router.get('/users/:channel', async (req, res) => {
    const { channel } = req.params;

    try {
        const users = await User.find({ channels: channel });
        res.status(200).send(users);
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la récupération des utilisateurs', details: err.message });
    }
});

router.get('/list', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send(users);
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la récupération des utilisateurs', details: err.message });
    }
});


module.exports = router;