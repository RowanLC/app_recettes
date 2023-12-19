const mongoose = require('mongoose');

const categoriesSchema = new mongoose.Schema({
    nom: String
});

module.exports = mongoose.model('Categories', categoriesSchema, 'catégories');