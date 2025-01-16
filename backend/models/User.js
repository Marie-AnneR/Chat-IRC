const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    channels: { type: [String], default: ['management'] },
    createdAt: { type: Date, default: Date.now },
});

// Hachage du mot de passe avant la sauvegarde
userSchema.pre('save', async function (next) {
  // Vérifie si le mot de passe a déjà été haché
  if (!this.isModified('password') || this.password.startsWith('$2b$')) {
      return next(); // Ignore si le mot de passe n'a pas été modifié ou est déjà haché
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log('Mot de passe haché avant sauvegarde :', this.password); // Log pour confirmation
  next();
});

// comparer les mots de passe
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);