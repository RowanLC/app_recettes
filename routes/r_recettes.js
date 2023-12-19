const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Recette = mongoose.model('Recettes');
const Categorie = mongoose.model('Categories');
const Commentaire = mongoose.model('Commentaires');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    // Propriété spécifiant le répertoire de destination où les fichiers téléchargés seront stockés
    // - 'req' : Requête HTTP
    // - 'file' : Objet de fichier
    // - 'cb' : Fonction de rappel
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/');
    },
    // Propriété spécifiant comment les noms de fichiers téléchargés seront générés
    filename: function(req, file, cb) {
        // Le nom du fichier est composé en utilisant le nom de champ du fichier ('field.filename'), la date actuelle ('Date.now()') et l'extension du fichier d'origine ('path.extname(file.originalname)')
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage })

// Déclaration de la route HTTP GET avec le chemin '/'
router.get('/', (req, res) => {
    // Utilisation du modèle 'Recette' pour effectuer une requête de recherche dans la collection MongoDB correspondante
    // Récupère toutes les recettes de la base de données
    Recette.find()
    // Si la recherche est réussie, la fonction 'then()' est appelée avec un tableau de recettes en tant que paramètre
    .then(recettes => {
        // Les recettes sont transmises à la vue 'recettes' lors du rendu
        // Messages flash stockés dans la requête '(req.flash())' également passés à la vue
        res.render('recettes', { recettes, messages: req.flash() });
    })
    .catch(err => {
        console.error(err);
        // En cas d'erreur, la réponse HTTP est configurée avec le statut 500 (Erreur interne du serveur) et un message d'erreur est renvoyée au client
        res.status(500).send('Erreur lors de la récupération des recettes');
    });
});

router.get('/ajouter', (req, res) => {
    res.render('ajouter-recette');
});

// AJOUTER UNE RECETTE
// Cette route est définie pour gérer les requêtes POST vers l'URL '/ajouter'
// Elle utilise la méthode 'async' pour gérer les opérations asynchrones
// 'upload.single('imageRecette')' définit le stockage des images
router.post('/ajouter', upload.single('imgRecette'), async (req, res) => {
    try {
        // Les données du formulaire sont extraites du corps de la requête 'req.body'
        // Ces données comprennent le titre de la recette, la description et la catégorie à laquelle elle appartient
        const { nom, description, categorie } = req.body;
        // Définit le chemin de l'image
        let imgPath = '';
        // Code à exécuter si l'image existe
        if (req.file) {
            imgPath = '/uploads/' + req.file.filename;
        };
        // Une nouvelle instance du modèle Recette est créée avec les données extraites du formulaire
        // Cette instance est stockée dans la variable 'nvRecette'
        // La propriété 'categorie' est un tableau contenant la catégorie de la recette
        const nvRecette = new Recette({
            nom,
            description,
            categorie: [categorie],
            image: imgPath
        });
        // La méthode 'save()' est appelée pour enregistrer la nouvelle recette dans la base de données
        // L'opération est marquée avec 'await' car elle est asynchrone
        await nvRecette.save();
        // Si l'ajout de la recette est réussie, un message de succès est stockée dans la session 'req.flash()'
        req.flash('success', 'Recette ajoutée avec succès !');
        // L'utilisateur est ensuite redirigé vers la page '/recettes'
        res.redirect('/recettes');
    } catch(err) {
        console.error(err);
        // En cas d'erreur lors de l'ajout de la recette, une erreur est affichée dans la console, un message d'erreur est stocké dans la session flash
        req.flash('error', 'Erreur lors de l\'ajout de la recette');
        // L'utilisateur est redirigé vers la page '/recette/ajouter'
        res.redirect('/recettes/ajouter');
    };
});

// MODIFIER UNE RECETTE
// Déclaration de la route HTTP 'GET' avec le chemin '/modifier/:id'
// Cette route répond aux requêtes GET vers l'URL '/modifier' suivant d'un id dynamique
router.get('/modifier/:id', (req, res) => {
    // Utilisation du modèle Recette pour effecturer une recherche dans la base de données MongoDB en utilisant l'id fourni dans les paramètres de la requête '(req.params.id)'
    Recette.findById(req.params.id)
    // Si la recherche est réussie, la fonction '.then()' est appelée avec la recette trouvée en tant que paramètre
    // La fonction '.then()' rend ensuite la vue 'modifier-recette' et passe la recette comme donnée à la vue
    .then(recette => res.render('modifier-recette', { recette }))
    .catch(err => {
        console.error(err);
        // Redirection vers la page '/recettes'
        res.redirect('/recettes');
    });
});

// Déclaration d'une route HTTP 'POST' avec le chemin '/modifier/:id'
// Cette route répond aux requêtes POST vers l'URL '/modifier' suivi d'un id dynamique
router.post('/modifier/:id', (req, res) => {
    // Utilisation du modèle 'Recette' pour mettre à jour une cette dans la base de données MogoDB en utilisant l'identifiant fourni dans les paramètres de la requête '(req.params.id)'
    // Les données à mettre à jour sont extraites du corps de la requête '(req.body)'
    // '{ new: true }' retourne la version mise à jour de la recette après la modification
    Recette.findByIdAndUpdate(req.params.id, req.body, { new: true })
    // Si la mise à jour est réussie, la fonction '.then()' est appelée dans paramètre
    .then(() => {
        // 'req.flash' indique que la recette a été modifiée avec succès
        req.flash('success', 'Recette modifiée avec succès');
        // L'utilisateur est redirigée vers '/recettes'
        res.redirect('/recettes');
    })
    .catch(err => {
        console.error(err);
        req.flash('error', 'Erreur lors de la modification de la recette.');
        // Redirection de l'utilisateur vers la page de modification de la recette correspondante
        res.redirect('/recettes/modifier/' + req.params.id);
    });
});

// SUPPRESSION D'UNE RECETTE
// Déclaration de la route HTTP 'GET' avec le chemin '/supprimer/:id'
router.get('/supprimer/:id', async (req, res) => {
    try {
        // Utilisation du modèle Mongoose 'Recette' pour effectuer une requête de recherche dans la collection MongoDB correspondante
        // Récupère la recette spécifiée par l'ID passé en paramètre dans l'URL
        const recette = await Recette.findById(req.params.id);
        // Vérifie si la recette existe et si elle a un champ 'image' défini
        if (recette && recette.image) {
            // Construit le chemin complet vers le fichier image associé à la recette
            const imgPath = path.join(__dirname, '..', 'public', recette.image);
            // Utilise le modèle 'fs' pour supprimer le fichier image associé à la recette
            fs.unlink(imgPath, (err) => {
                if (err) {
                    console.error("Erreur lors de la suppression de l'image : ", err)
                }
            });
        };
        // Utilisation du modèle Mongoose pour supprimer la recette de la base de données en fonction de l'ID passé en paramètre dans l'URL
        await Recette.findByIdAndDelete(req.params.id);
        req.flash('success', 'Recette supprimée avec succès.');
        res.redirect('/recettes');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Erreur lors de la suppression de la recette.');
        res.redirect('/recettes')
    };
});

// Déclaration de la route 'GET' avec le chemin '/detail/:id'
router.get('/detail/:id', (req, res) => {
    // Récupère l'ID de la recette à partir des paramètres de l'URL et le stocke dans la variable 'id'
    const id = req.params.id;
    // Utilisation du modèle Mongoose 'Recette' pour effectuer une requête de recherche dans la collection MongoDB correspondante en utilisant l'ID de la recette
    Recette.findById(id)
    // Utilisation d'une promesse pour traiter le résultat de la recherche de la recette
    .then(recette => {
        // Utilisation du modèle Mongoose 'Commentaire' pour rechercher tous les commentaires associés à la recette spécifiée par l'ID
        Commentaire.find({ idRecette: id })
        // Utilisation d'une autre promesse pour traiter le résultat de la recherche des commentaires associés à la recette
        // Si la recherche réussit, les commentaires sont passés comme argument à la fonction de rappel
        .then(commentaires => {
            // Rend la vue 'detail-recette'
            res.render('details-recette', {
                recette: recette,
                commentaires: commentaires,
                messages: req.flash()
            });
        })
        .catch(err => console.error(err));
    })
    .catch(err => {
        console.error(err);
        // Envoie une réponse avec le statut HTTP 404, avec un message indiquant que la recette n'a pas été trouvée - se produit en cas d'erreur ou si la recette n'existe pas
        res.status(404).send('Recette non trouvée');
    });
});

// ':categorieId' est un paramètre de chemin dynamique qui peut être extrait de la requête
router.get('/categorie/:categorieId', async(req, res) => {
    try {
        // Utilise la méthode 'find()' pour rechercher des recettes dans la base de données
        // La condition de recherche est basé sur le paramètre de chemin ':categorieId'
        // La méthode populate est utilisée pour remplacer automatiquement les identifiants de catégorie dans les recettes par les documents de catégorie correspondant
        const recettes = await Recette.find({ categories: req.params.categorieId }).populate('categories');
        // Lorsque les recettes sont récupérées avec succès, la fonction render est utilisée pour afficher la vue nommée 'recettes'
        // Les données à envoyer à la vue sont passées sous forme d'objets
        // Dans cet objet, 'recettes' contient les recettes récupérées, et 'message' contient les messages flash stockés dans la requête
        res.render('recettes', {
            recettes,
            messages: req.flash()
        });
    } catch(err) {
        console.error(err);
        // Un message flash d'erreur est stocké dans la requête à l'aide de la méthode 'flash' de Connect-flash
        // Les messages flash sont généralement utilisés pour afficher des messages d'une requête à l'autre, souvent après une redirection
        req.flash('error', 'Une erreur est survenue');
        // La réponse est redirigée vers l'URL '/recettes' après avoir rencontré une erreur
        res.redirect('/recettes');
    }
});

// Déclération de la route HTTP 'GET' avec le chemin '/recherche'
router.get('/recherche', async (req, res) => {
    try {
        // Initialisation d'un objet vide appelé 'query' qui sera utilisé pour construire la requête de recherche
        const query = {};
        // Vérifie si la requête 'GET' contient un paramètre 'nom'
        if (req.query.nom) {
            // Si 'nom' est présent, crée une expression régulière (RegExp) pour effectuer une recherche insensible à la casse
            query.nom = new RegExp(req.query.nom.trim(), 'i');
        }
        // Effectue une recherche dans la collection MongoDB 'Recette' en utilisant la requête construite
        // 'populate()' est utilisée pour remplacer les identifiants de catégories dans le résultat par les documents de catégorie réels
        const recettes = await Recette.find(query).populate('categories');
        // Affichage des recettes trouvées dans la console
        console.log('Recettes trouvées : ', recettes);
        // Rendu de la vue 'resultats-recherche' en passant les recettes trouvées comme données
        res.render('resultats-recherche', { recettes });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur lors de la recherche");
    };
});

module.exports = router;