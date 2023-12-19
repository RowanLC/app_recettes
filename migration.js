const mongoose = require('mongoose');
const Recette = require('./models/recettes');
const Categorie = require('./models/categories');
const { MongoClient } = require('mongodb');

// Connexion à la base de données
// '{ useNewUrlParser: true, useUnifiedTopology: true }' sont utilisés pour éviter les avertissements de dépréciation
// La méthode 'connect' renvoie une promesse
mongoose.connect('mongodb://127.0.0.1:27017/app_recettes', { useNewUrlParser: true, useUnifiedTopology: true })
    // Les méthodes '.then' et '.catch' sont utilisés pour gérer le succès ou l'échec de la connexion
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur de connexion à MongoDB', err));

    const connectionString = 'mongodb://127.0.0.1:27017/app_recettes';
    const dbName = 'app_recettes';
    const oldColName = 'catégories';
    const newColName = 'categories';

    async function renameCollection() {
        const client = new MongoClient(connectionString, {useNewUrlParser: true, useUnifiedTopology: true});

        try {
            await client.connect();
            const database = client.db(dbName);
            const collection = database.collection(oldColName);

            await collection.rename(newColName);

            console.log('La collection a été renommée avec succès');
        } finally {
            await client.close();
        }
    }

    renameCollection().catch(err => console.error('Erreur : ', err));

    // const imgPatesBolognaise = './public/pates_bolo.jpg';
    // const imgGateauYaourt = './public/gateau_yaourt.jpg';
    // const imgQuicheLegumes = './public/quiche_legumes.jpg';  // Assurez-vous d'avoir l'extension (.jpg) ici
    
    // // Mise à jour pour les Pâtes Bolognaise
    // Recette.updateMany(
    //     { titre: 'Pâtes Bolognaise' },
    //     { $set: { image: imgPatesBolognaise } },
    //     (err, result) => {
    //         if (err) {
    //             console.error(err);
    //         } else {
    //             console.log('Champ "image" ajouté avec succès pour les Pâtes Bolognaise:', result);
    //         }
    //     }
    // );
    
    // // Mise à jour pour le Gâteau au Yaourt
    // Recette.updateMany(
    //     { titre: 'Gâteau au Yaourt' },
    //     { $set: { image: imgGateauYaourt } },
    //     (err, result) => {
    //         if (err) {
    //             console.error(err);
    //         } else {
    //             console.log('Champ "image" ajouté avec succès pour le Gâteau au Yaourt:', result);
    //         }
    //     }
    // );
    
    // // Mise à jour pour la Quiche aux Légumes
    // Recette.updateMany(
    //     { titre: 'Quiche aux Légumes' },
    //     { $set: { image: imgQuicheLegumes } },
    //     (err, result) => {
    //         if (err) {
    //             console.error(err);
    //         } else {
    //             console.log('Champ "image" ajouté avec succès pour la Quiche aux Légumes:', result);
    //         }
    //     }
    // );
    
// // Fonction asynchrone permettant de rechercher une catégorie dans la base de données MongoDB
// async function trouverCreerCategorie(nom) {
//     // Fonction 'await' pour attendre la promesse retournée par 'Categorie.findOne'
//     // Cela permet d'effectuer une recherche asynchrone dans la base de donénes MongoDB pour une catégorie avec le nom spécifié
//     let categorie = await Categorie.findOne({ nom: nom });
//     // Cette fonction vérifie si la catégorie existe '(!categorie)'
//     // Si la catégorie n'existe pas, une nouvelle instance de la classe 'Categorie' est créée avec le nom spécifié
//     if (!categorie) {
//         categorie = new Categorie({ nom: nom });
//         // La méthode 'save' est appelée pour sauvegarder la nouvelle catégorie dans la base de données
//         await categorie.save();
//     };
//     return categorie;
// };

// async function creerRecettes() {
//     try {
//         // Crée ou trouver les catégories
//         const categorieAvecViande = await trouverCreerCategorie('Avec viande');
//         const categorieDessert = await trouverCreerCategorie('Dessert');
//         const categorieVegetarien = await trouverCreerCategorie('Végétarien');

//         // Création recettes
//         const recBolo = new Recette({
//             nom: 'Pâtes Bolognaise',
//             description: 'Plat mythique avec de la viande',
//             categorie: [categorieAvecViande._id],
//         });

//         const recGateauYaourt = new Recette({
//             nom: 'Gâteau au Yaourt',
//             description: 'Gâteau très simple à réaliser comprenant peu d\'ingrédients',
//             categorie: [categorieDessert._id],
//         });

//         const recQuicheLegumes = new Recette({
//             nom: 'Quiche aux Légumes',
//             description: 'La version végétarienne de la fameuse quiche lorraine !',
//             categorie: [categorieVegetarien._id],
//         });

//         await recBolo.save();
//         await recGateauYaourt.save();
//         await recQuicheLegumes.save();

//         console.log('Recette ajoutée avec succès');
//     } catch (err) {
//         console.log('Erreur lors de la création de la recette', err);
//     };
// };

// creerRecettes();



    // Le schéma Mongoose est définit pour représenter la structure des documents d'une collection
    // const userSchema = new mongoose.Schema({
    //     // Le schéma ci-présent représente un utilisateur avec les propriété 'nom', 'email', 'motDePasse' et 'role'
    //     nom: String,
    //     email: String,
    //     motDePasse: String,
    //     role: String,
    // });
    // // À partir du schéma, un modèle Mongoose est crée
    // // Le modèle est utilisé pour interagir avec la collection correspondante
    // // Ici, le modèle est nommé 'User' et correspond à la collection d'utilisateurs
    // const User = mongoose.model('Utilisateur', userSchema);

    // // Méthode 'insertMany' utilisée pour insérer un ou plusieurs documents dans la collection associée au modèle 'User'
    // const userDocs = User.insertMany([
    //     { nom: 'Rowan Lecuyer', email: 'rowan123@gmail.com', motDePasse: 'prout23', role: 'Admin' }
    // ]);

    // Schéma Mongoose 'Ingrédients'
    // const ingSchema = new mongoose.Schema({
    //     nom: String,
    //     calories: Number,
    //     couleur: String,
    // });
    // const Ingredients = mongoose.model('Ingredient', ingSchema);

    // const ingDocs = Ingredients.insertMany([
    //     { nom: 'Boeuf haché', calories: 332, couleur: 'Rouge' }
    // ]);

    // // Schéma Mongoose 'Commentaires'
    // const comSchema = new mongoose.Schema({
    //     auteur: String,
    //     texte: String,
    //     note: Number,
    //     idRecettes: Number,
    // });
    // const Commentaires = mongoose.model('Commentaires', comSchema);

    // const comDocs = Commentaires.insertMany([

    // ]);

    // Schema Mongoose 'Catégories'
    // const catSchema = new mongoose.Schema({
    //     categorie: String,
    // })
    // const Categories = mongoose.model('Catégories', catSchema);

    // const catDocs = Categories.insertMany([
    //     { nom: 'Avec viande' },
    //     { nom: 'Dessert' },
    //     { nom: 'Végétarien' }
    // ]);
    // console.log('Catégorie insérée', catDocs);

    // // Schéma Mongoose 'Recettes'
    // const recSchema = new mongoose.Schema({
    //     nom: String,
    //     categorie: {type: mongoose.Schema.Types.ObjectId, ref: 'Categorie'},
    //     description: String,
    //     image: String,
    // });
    // const Recettes = mongoose.model('Recettes', recSchema);

    // const recDocs = Recettes.insertMany([
    //     { nom: 'Pâtes Bolognaise', categorie: [categorieAvecViande._id], description: 'Plat mythique avec de la viande', image: '(plus tard)'}
    // ]);