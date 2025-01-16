import axios from 'axios';

const handleCommand = async (command, user, currentChannel, setCurrentChannel) => {
    const [cmd, ...args] = command.split(' ');
    switch (cmd) {
        case '/nick':
            if (args.length < 1) {
                alert('Usage : /nick new_username');
                return;
            }
            try {
                const newUsername = args[0];
                await axios.post('http://localhost:5000/api/users/nick', {
                    oldUsername: user.username,
                    newUsername,
                });
                alert(`Votre pseudonyme a été changé en ${newUsername}`);
                user.username = newUsername; // Met à jour localement
            } catch (err) {
                console.error('Erreur lors du changement de pseudonyme :', err.message);
                alert('Impossible de changer le pseudonyme.');
            }
            break;

        case '/join':
            if (args.length < 1) {
                alert('Usage : /join channel_name');
                return;
            }
            try {
                const channelName = args[0];
                await axios.post('http://localhost:5000/api/rooms/join', {
                    username: user.username,
                    channel: channelName,
                });
                alert(`Vous avez rejoint le canal ${channelName}`);
                setCurrentChannel(channelName); // Change de canal
            } catch (err) {
                console.error('Erreur lors de la connexion au canal :', err.message);
                alert('Impossible de rejoindre ce canal.');
            }
            break;

        case '/leave':
            if (args.length < 1) {
                alert('Usage : /leave channel_name');
                return;
            }
            try {
                const channelName = args[0];
                await axios.post('http://localhost:5000/api/rooms/quit', {
                    username: user.username,
                    channel: channelName,
                });
                alert(`Vous avez quitté le canal ${channelName}`);
                if (channelName === currentChannel) {
                    setCurrentChannel('management'); // Revient au canal par défaut
                }
            } catch (err) {
                console.error('Erreur lors de la sortie du canal :', err.message);
                alert('Impossible de quitter ce canal.');
            }
            break;

        case '/list':
            try {
                const res = await axios.get('http://localhost:5000/api/rooms/list');
                alert(`Canaux disponibles :\n${res.data.map((c) => c.name).join('\n')}`);
            } catch (err) {
                console.error('Erreur lors de la récupération des canaux :', err.message);
                alert('Impossible de récupérer la liste des canaux.');
            }
            break;

        case '/create':
            if (args.length < 1) {
                alert('Usage : /create channel_name');
                return;
            }
            try {
                const channelName = args[0];
                await axios.post('http://localhost:5000/api/rooms/create', {
                    name: channelName,
                    createdBy: user.username,
                });
                alert(`Canal "${channelName}" créé avec succès.`);
            } catch (err) {
                console.error('Erreur lors de la création du canal :', err.message);
                alert('Impossible de créer le canal.');
            }
            break;

        case '/msg':
            if (args.length < 2) {
            alert('Usage : /msg username message_content');
            return;
            }
            try {
            const [recipient, ...messageParts] = args;
            const messageContent = messageParts.join(' ');
            await axios.post('http://localhost:5000/api/messages/send', {
                sender: user.username,
                recipient,
                content: messageContent,
                type: 'private',
            });
            alert(`Message envoyé à ${recipient}`);
            } catch (err) {
            console.error('Erreur lors de l’envoi du message privé :', err.message);
            alert('Impossible d’envoyer le message.');
            }
            break;

            case '/who':
                if (args.length < 1) {
                    alert('Usage : /who channel_name');
                    return;
                }
                try {
                    const channelName = args[0];
                    const res = await axios.get(`http://localhost:5000/api/users/users/${channelName}`);
                    alert(`Utilisateurs dans ${channelName} :\n${res.data.map((u) => u.username).join('\n')}`);
                } catch (err) {
                    console.error('Erreur lors de la récupération des utilisateurs :', err.message);
                    alert('Impossible de récupérer la liste des utilisateurs.');
                }
                break;

        case '/quit':
            try {
                alert('Vous avez été déconnecté.');
                window.location.reload(); // Recharge la page pour simuler une déconnexion
            } catch (err) {
                console.error('Erreur lors de la déconnexion :', err.message);
            }
            break;


        case '/help':
            alert(
                'Commandes disponibles :\n' +
                '/nick new_username - Changer de pseudonyme\n' +
                '/join channel_name - Rejoindre un canal\n' +
                '/leave channel_name - Quitter un canal\n' +
                '/list - Lister les canaux\n' +
                '/create channel_name - Créer un nouveau canal\n' +
                '/msg username message_content - Envoyer un message privé\n' +
                '/who channel_name - Lister les utilisateurs d’un canal\n' +
                '/quit - Déconnexion\n' +
                '/help - Afficher cette aide'
            );
            break;

        default:
            alert(`Commande inconnue : ${cmd}`);
            break;
    }
};

export default handleCommand;