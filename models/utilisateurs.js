const mongoose = require('mongoose');

// Création du schéma Mongoose pour les utilisateurs
const utilisateursSchema = new mongoose.Schema({
    nom: String,
    // 'unique: true' pour indiquer que chaque adresse mail doit être unique dans la collection
    email: {type: String, unique: true},
    motDePasse: String,
    // De type 'String', l'option 'enum' limite les valeurs possibles à 'utilisateur', 'admin' ou 'auteur'
    // 'default' indique que si aucune valeur n'est fournie, le rôle par défaut est 'utilisateur'
    role: {type: String, enum: ['utilisateur', 'admin', 'auteur'], default: 'utilisateur'},
});

// 'Utilisateurs' = Nom du modèle
// 'utilisateurs' = Nom de la collection dans MongoDB
// Permet d'effectuer des opération CRUD
module.exports = mongoose.model('Utilisateurs', utilisateursSchema, 'utilisateurs');