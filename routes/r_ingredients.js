const express = require('express');
// Création du routeur
const router = express.Router();
const mongoose = require('mongoose');
const Ingredient = mongoose.model('Ingredients');

// Déclaration d'une route 'GET' pour le chemin d'URL '/' - lorsqu'un client accède à la racine de l'URL, la fonction de rappel spécifiée est exécutée
// 'GET' sert à récupérer des données
router.get('/', (req, res) => {
    // Utilise le modèle Mongoose 'Ingredient' pour effectuer une requête afin de récupérer tous les documents (ingrédients) de la collection associée dans la base de données - la méthode 'find()' retourne une promesse
    Ingredient.find()
    // Si la requête est un succès, la fonction de rappel dans le bloc 'then' est exécutée - elle reçoit les ingrédients récupérés de la base de données sous forme d'objet ou de tableau d'objets
    .then(ingredients => {
        // Méthode pour rendre la vue 'ingredients' (en l'occurrence 'ingredients.ejs')
        res.render('ingredients', { ingredients });
    })
    // Gestion des erreurs avec le 'catch()'
    .catch(err => {
        console.error(err);
        // Logge l'erreur dans la console et renvoie une réponse avec un statut HTTP 500, indiquant qu'il y a eu une erreur lors de la récupération des ingrédients
        res.status(500).send('Erreur lors de la récupération des ingrédients')
    });
});

// EXPORTATION DU ROUTER
module.exports = router;