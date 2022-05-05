
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json());

// jwt algo = 07683e0a5100034c68c57da59da2c9a77cf61d2446efe229a4c112c4472b1c7ffcd2ac63fb525eba99bf3983bbdd014053915566cc2f275a17d10b0c15152706


function verifyToken(req, res, next) {
    const header = req.headers.authorization;
    console.log('inseide token', header);
    if (!header) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = header.split(' ')[1];
    console.log(token);
    jwt.verify(token, process.env.JWT_ALGO_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden' });
        }
        console.log(decoded)
        req.decoded = decoded;
    })
    next()
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gy6zj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        await client.connect();
        const bookCollections = client.db("books").collection("book");


        // auth
        app.post('/login', async (req, res) => {
            const user = req.body;
            console.log(user);
            const accessToken = jwt.sign(user, process.env.JWT_ALGO_SECRET, {
                expiresIn: '1d'
            })
            res.send({ accessToken })
        })

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
        app.put('/books/:id', async (req, res) => {
            const id = req.params.id;
            console.log(req.body)
            const quantity = req.body
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedQuantity = {
                $set: { quantity }
            }
            const result = await bookCollections.updateOne(filter, updatedQuantity, options);
            res.send(result);
        });

        //delete one item.
        app.delete('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookCollections.deleteOne(query);
            res.send(result);
        });

        //add Books inventory
        app.post("/book", async (req, res) => {
            const addInventory = req.body;
            const result = await bookCollections.insertOne(addInventory)
            res.send(result);
        });

        //load single users items.
        app.get('/books', verifyToken, async (req, res) => {
            
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                console.log(query);
                const cursor = bookCollections.find(query);
                const result = await cursor.toArray();
                res.send(result);
            }
            else{
                res.status(403).send({message: "Forbidden access"});
            }
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