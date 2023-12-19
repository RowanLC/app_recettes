const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Recette = mongoose.model('Recette');
const Commentaire = mongoose.model('Commentaires');

// Déclaration de la route HTTP 'POST' avec le chemin '/ajouter/:idRecette'
router.post('/ajouter/:idRecette', (req, res) => {
    // Récupère la valeur du paramètre 'idRecette' de la requête URL - en l'occurrence l'ID de la recette à laquelle le commentaire sera ajouté
    const { idRecette } = req.params;
    // Récupération des données du corps de la requête 'POST'
    const { contenu, note, idUtilisateur } = req.body;

    // Création d'une nouvelle instance de modèle Commentaire
    const newCommentaire = new Commentaire({
        texte,
        note,
        idRecette,
        idUtilisateur
    });

    // Enregistrement du nouveau commentaire dans la base de données
    newCommentaire.save()
        .then(() => {
            req.flash('success', 'Commentaire ajouté avec succès');
            res.redirect('/recettes');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Erreur lors de l'ajoute du commentaire");
        });
});

module.exports = router;