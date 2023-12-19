const mongoose = require('mongoose');

const ingredientsSchema = new mongoose.Schema({
    nom: String,
    calories: Number,
    couleur: String,
});

module.exports = mongoose.model('Ingredients', ingredientsSchema);