const mongoose = require('mongoose');

const recettesSchema = new mongoose.Schema({
    nom: String,
    categorie: [{type: mongoose.Schema.Types.ObjectId, ref: 'Categories'}],
    description: String,
    image: String,
});

module.exports = mongoose.model('Recettes', recettesSchema, 'recettes');