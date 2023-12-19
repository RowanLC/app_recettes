// Utilisation d'Express
const express = require('express');
const mongoose = require('mongoose');
// 'express-session' : Middleware basé sur Express
// Une session est un mécanisme qui permet à un serveur de se souvenir des informations spécifiques à un utilisateur entre plusieurs requêtes HTTP, généralement stockés sous forme de cookies
const session = require('express-session');
// 'connect-flash' est un middleware utilisé pour afficher des messages temporaires aux utilisateurs
const flash = require('connect-flash');
// 'path' est un module intégré à Node.js fournissant des utilitaires pour travailler avec les chemins de fichiers et de répertoires
const path = require('path');
// 'passport' est une bibliothèque d'authentification pour les applications Node.js
const passport = require('passport');
// 'passport-local' est utilisé pour l'authentification locale
// 'Strategy' permet de configurer une stratégie d'authentification
const LocalStrategy = require('passport-local').Strategy;
// 'bcrypt' est une bibliothèque de hachage de mots de passe
const bcrypt = require('bcrypt');
// Utilisation du modèle Utilisateurs
const Utilisateur = require('./models/utilisateurs');


// Pour créer une application Express
const app = express();
// Configuration du moteur de modèle EJS
app.set('view engine', 'ejs');
// Définission du dossier 'views'
app.set('views', path.join(__dirname, ('views')));

// Configuration et utilisation du middleware 'express-session'
app.use(session({
    // Chaîne secrète utilisée pour signer des cookies de session
    // Ajoute une couche de sécurité en garantissant que le cookie de session n'a pas été altéré par l'utilisateur
    secret: 'secretUnique',
    // Définit sur FALSE : la session ne sera pas sauvegardée à chaque requête
    resave: false,
    // Définit sur FALSE : la session ne sera pas sauvegardée pour une session qui n'a pas été initialisée
    saveUninitialized: false,
    // Spécifie les paramètres du cookie de session
    // Si c'est TRUE, le cookie de session ne sera envoyée que sur des connexions HTTPS sécurisées
    cookie: { secure: false }
}));

// INITIALISATION DE 'connect-flash'
app.use(flash());

// CONFIGURATION DES MIDDLEWARES
/* 'app.use(express.urlencoded({ extended: true }));' :
 - Middleware utilisé pour analyser les données du corps des requêtes HTTP avec le type de contenu 'application/x-www-form-urlencoded' 
 - Il est couramment utilisé pour analyser des formulaires HTML
 - Si 'extended' est sur TRUE : les données analysées seront présentés sous forme d'objets complexes pouvant contenir des tableaux et d'autres objets
 - Si 'extended' est sur FALSE : les données analysées seront présentés sous forme d'objets simples, ne pouvant contenir que des chaînes de caractères ou des tableaux */ 
app.use(express.urlencoded({ extended: true }));
// Middleware utilisé pour servir des fichiers statiques tels que des images, des fichiers CSS, fichiers JavaScript...
// Prend en charge un répertoire spécifié et permet à ces fichiers d'être servis directement sans avoir besoin de routes supplémentaires
app.use(express.static(path.join(__dirname, 'public')));

// CONFIGURATION DU PASSPORT
// Initialisation du passport
app.use(passport.initialize());
// Utilisation des sessions avec passport
// Gère l'état de l'authentification entre les requêtes et prend en charge la sérialisation et désérialisation des utilisateurs dans les sessions
app.use(passport.session());

/* CONFIGURATION D'UNE STRATÉGIE LOCALE
La stratgie locale est couramment utilisée pour l'authentification basée sur un nom d'utilisateur et un mot de passe stockés localement
*   - 'passport.use(new LocalStrategy(...))' est une nouvelle instance de la stratégie locale et l'ajoute à Passport
*   - La stratégie locale prend en compte 2 arguments :
      _ Les options de configuration
      _ Une fonction de validation */
passport.use(new LocalStrategy(
    // Configure la stratégie locale pour utiliser le champ 'email' comme nom d'utilisateur
    { usernameField: 'email' },

    // Fonction appelée lorsqu'un utilisateur tente de s'authentifier
    // 'done' est une fonction à appeler pour indiquer à Passport le résultat de l'authentification
    async (email, password, done) => {
        try {
            console.log(`Recherche de l'utilisateur avec l'email ${email}`);
            // La fonction commence par rechercher un utilisateur dans la base de données en utilisant l'email fournit
            const utilisateur = await Utilisateur.findOne({ email: email });

            // Si aucun utilisateur est trouvé, cette phrase s'affiche
            if (!utilisateur) {
                console.log(`Aucun utilisateur trouvé avec l'email ${email}`);
                return done(null, false, { message: 'Email non trouvé' });
            }

            // Si un utilisateur est trouvé, on utilise 'bcrypt.compare' afin de comparer le mot de passe fourni avec le mot de passe haché stocké dans la base de données
            console.log(`Utilisateur trouvé, comparaison des mots de passe`);
            const correspondance = await bcrypt.compare(password, utilisateur.motDePasse);

            // Si les mots de passe ne correspondent pas, un message d'erreur est envoyé avec 'done'
            if (!correspondance) {
                console.log(`Mot de passe incorrect pour l'email ${email}`);
                return done(null, false, { message: 'Mot de passe incorrect'});
            }

            console.log(`Authentification réussie pour l'email ${email}`);
            return done(null, utilisateur);

          // Gestion des erreurs avec le catch : la fonction appelle 'done' si une erreur d'authentification survient  
        } catch (err) {
            console.log('Erreur lors de l\'authentification', err);
            return done(err);
        }
    }
));

/* EXPLICATION SÉRIALISATION
* - SÉRIALISATION : Processus de conversion d'une structure de données ou d'un objet en une séquence de bits (ou
    une chaîne de caractères) afin de pouvoir la stocker dans un fichier, la transmettre sur le réseau ou la sauvegarder dans une session */
// La méthode 'serializeUser' prend un utilisateur en entrée et appelle la fonction 'done' avec l'ID de l'utilisateur en tant que 2ème argument
passport.serializeUser((utilisateur, done) => {
    done(null, utilisateur.id);
});

/* EXPLICATION DÉSÉRIALISATION
Ce sont deux processus distincts utilisés pour convertir des données dans un format pouvant être stocké, transmis ou reconstruit ultérieurement
* - DÉSÉRIALISATION : C'est l'inverse - c'est la reconstruction de la structure de données à partir de la séquence
    de bits ou de la chaîne de caractères générée lors de la sérialisation */
// 'passport.derializeUser(async (id, done) => { ... })' : configure la fonction de désérialisation pour Passport. Lorsqu'un identifiant d'utilisateur sérialisé est reçu, cette fonction est appelée pour récupérer les informations de l'utilisateur associées à cet identifiant
passport.deserializeUser(async (id, done) => {
    try {
        // À l'aide de l'identifiant fourni, la fonction recherche l'utilisateur dans la base de données en utilisant la méthode 'findById'
        const utilisateur = await Utilisateur.findById(id);
        // Si l'utilisateur est trouvé avec succès, la fonction 'done' est appelée avec 'null' en tant que premier argument et l'objet utilisateur récupéré en tant que deuxième argument - cela signale à Passport que la désérialisation est réussie
        done(null, utilisateur);
      // Gestion des erreurs avec le 'catch', la fonction 'done' est appelée avec l'erreur en tant qu'argument, signalant à Passport qu'il y a eu une erreur lors de la désérialisation
    } catch (err) {
        done(err);
    }
});

// CONNEXION À MONGODB
mongoose.connect('mongodb://127.0.0.1:27017/app_recettes')
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur de connexion à MongoDB', err));

// IMPORTATION DES MODÈLES
require('./models/utilisateurs');
require('./models/recettes');
require('./models/categories');
require('./models/ingredients');
require('./models/commentaires');

// IMPORTATION DES ROUTES
const utilisateursRouter = require('./routes/r_utilisateurs');
const recettesRouter = require('./routes/r_recettes');
const ingredientsRouter = require('./routes/r_ingredients');

// PAGE D'ACCUEIL
app.get('/', (req, res) => {
    res.render('accueil');
});

// Utilisation des routes
app.use('/utilisateurs', utilisateursRouter);
app.use('/recettes', recettesRouter);
app.use('/ingredients', ingredientsRouter);

/* GESTION DES ERREURS
* - 'req' définit la requête
* - 'res' définit la réponse
* - 'next' définit la fonction qui va être appelée pour passer à la suite */
app.use((req, res, next) => {
    res.status(404).send("Page non trouvée");
});

// DÉFINITION DU PORT DU SERVEUR
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});