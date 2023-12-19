const mongoose = require('mongoose');

const commentairesSchema = new mongoose.Schema({
    idUtilisateur: {type: mongoose.Schema.Types.ObjectId, ref:'Utilisateurs'},
    texte: String,
    note: Number,
    idRecettes: {type: mongoose.Schema.Types.ObjectId, ref:'Recettes'},
});

module.exports = mongoose.model('Commentaires', commentairesSchema);