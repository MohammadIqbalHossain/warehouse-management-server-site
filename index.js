
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gy6zj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        await client.connect();
        const bookCollections = client.db("books").collection("book");
       
        //API for get all data.
        app.get('/book', async (req, res) => {
            const query = {};
            const cursor = bookCollections.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        //API for getting one data.
        app.get('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookCollections.findOne(query);
            res.send(result);
        })


        //update quantity 
        app.put('/books/:id', async(req, res) => {
            const id = req.params.id;
            console.log(req.body)
            const quantity = req.body
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updatedQuantity = {
                $set: {quantity}
            }
            const  result = await bookCollections.updateOne(filter, updatedQuantity, options);
            res.send(result); 
        });

        //delete one item.
        app.delete('/book/:id', async(req,res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await bookCollections.deleteOne(query);
            res.send(result);
        });

        //add Books inventory
        app.post("/book", async(req, res) => {
            const addInventory = req.body;
            const result = await bookCollections.insertOne(addInventory)
            res.send(result);
        });

        //load singl users items.
        app.get('/books', async(req,res) => {
            const email = req.query.email;
            console.log(email);
            const query = {email: email};
            const cursor = bookCollections.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
    }
    finally {

    }

}

run().catch(console.dir);










app.get("/", (req, res) => {
    res.send("server Running");
})

app.listen(port, () => {
    console.log("Server is running", port);
})