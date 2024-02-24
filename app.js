require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();

const PORT = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

MongoClient.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database');
        const db = client.db('Quebec-database');
        const shoesCollection = db.collection('Quebec-collection');

        app.get('/', async (req, res) => {
            const shoes = await shoesCollection.find().toArray();
            res.render('index', { shoes });
        });

        app.get('/add', (req, res) => {
            res.render('add');
        });

        app.post('/shoes', async (req, res) => {
            await shoesCollection.insertOne(req.body);
            res.redirect('/');
        });

        app.get('/shoes/edit/:id', async (req, res) => {
            const shoe = await shoesCollection.findOne({ _id: new ObjectId(req.params.id) });
            res.render('edit', { shoe });
        });

        app.post('/shoes/update/:id', async (req, res) => {
            await shoesCollection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: { brand: req.body.brand, model: req.body.model, size: parseInt(req.body.size) } }
            );
            res.redirect('/');
        });

        app.post('/shoes/delete/:id', async (req, res) => {
            await shoesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
            res.redirect('/');
        });

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(console.error);
