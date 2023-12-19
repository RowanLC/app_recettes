const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Utilisateur = mongoose.model('Utilisateurs');
const passport = require('passport');

// Route répondant à une requête 'GET' sur l'URL '/inscription'
// Lorsqu'un utilisateur accède à cette URL, la fonction de rappel (callback) est exécutée
router.get('/inscription', (req, res) => {
    // Fonction pour rendre la vue 'inscriptions'
    res.render('inscriptions')
});

// Route répondant à une requête 'POST' sur l'URL 'inscription'
router.post('/inscription', async (req, res) => {
    try {
        // Lorsqu'un utilisateur soumet un formulaire à cet URL, la fonction de rappel est exécutée
        // La fonction commence par extraire les données du corps de la requête (req.body)
        const { nom, email, motDePasse, role } = req.body;
        // Utilise la bibliothèque 'bcrypt' pour hacher le mot de passe
        // La méthode 'bcrypt.hash' est asynchrone, 'await' est donc utilisé
        const mdpHash = await bcrypt.hash(motDePasse, 10);
        // Crée une nouvelle instance de modèle Utilisateur avec les données fournies
        const utilisateur = new Utilisateur({
            nom,
            email,
            motDePasse: mdpHash,
            role: role === 'auteur' ? 'auteur' : 'utilisateur'
        });
        // 'await utilisateur.save()' sauvegarde l'utilisateur dans la base de données
        await utilisateur.save();
        // Si tout se déroule avec succès, l'utilisateur est redirigé vers l'URL '/recettes'
        res.redirect('/recettes');
      // 'catch' pour capturer les erreurs
    } catch (err) {
        // Si erreur il y a, elle est enregistrée dans la console
        console.error(err);
        // Redirection de l'utilisateur vers l'URL 'inscription'
        res.redirect('/inscription');
    }
});

// Route répondant à une requête 'GET' sur l'URL '/connexion'
router.get('/connexion', (req, res) => {
    // Rendu de la vue 'connexion'
    // '{ messages: req.flash() }' passe les messages stockés dans la requête
    res.render('connexions', { messages: req.flash() });
});

// Route répondant à une requête 'POST' sur l'URL '/connexion'
router.post('/connexion', (req, res, next) => {
    // 'passport.authenticate' est utilisé pour authentifier l'utilisateur en utilisant une stratégie locale
    // 3 arguments : 'err', 'utilisateur' et 'info'
    // - 'err' pour les erreurs
    // - 'utilisateur' pour authentifier l'utilisateur
    // - 'info' pour des informations supplémentaires
    passport.authenticate('local', (err, utilisateur, info) => {
        // Si une erreur se produit pendant l'authentification (err), elle est transmise à la fonction 'next' pour être géré par le middleware suivant
        if (err) {
            return next(err);
        }
        // Si l'utilisateur est authentifié avec succès, c'est-à-dire 'utilisateur' est définit, un message d'erreur flash est stocké dans la requête, et l'utilisateur est redirigé vers la vue de connexion avec les messages flash
        if (!utilisateur) {
            req.flash('erreurConnexion', 'Email ou mot de passe incorrect');
            return res.render('connexions', { messages: req.flash() });
        }

        // Si l'authentification réussit et qu'il n'y a pas d'erreur, la fonction 'req.logIn' est utilisée pour enregistrer l'utilisateur dans la session
        req.logIn(utilisateur, (err) => {
            if (err) {
                return next(err);
            }
            // L'utilisateur est ensuite redirigé vers l'URL '/recettes'
            return res.redirect('/recettes');
        });
        // Si l'authentification échoue, c'est-à-dire que l'utilisateur est 'undefined', rien n'est fait, et la vue de connexion est rendue de nouveau avec les messages flash
    }) (req, res, next);
});

module.exports = router;