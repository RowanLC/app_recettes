const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Categorie = mongoose.Model('Categorie');

router.get('/categorie/:id', async (req, res) => {
    try {
        const id = req.params.id;

        Categorie.findById(id)
        .then(categorie => {
            res.render('categories', {
                categorie: categorie,
            })
        })
    } catch(err) {
        console.error(err);
        req.flash('error', 'Une erreur est survenue');
        res.redirect('/');
    }
})