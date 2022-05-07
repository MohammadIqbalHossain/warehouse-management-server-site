
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



function verifyToken(req, res, next) {
    console.log("something")
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = header.split(' ')[1];
    console.log(token);
    jwt.verify(token, process.env.JWT_ALGO_SECRET, (err, decoded) => {
        if (err) {
            console.log(err);
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


        // update quantity 
        app.put('/books/:id', async (req, res) => {
            const id = req.params.id;
            console.log(req.body)
            const quantity = req.body.quantity
            console.log(quantity)
            const filter = { _id: ObjectId(id)};
            const options = { upsert: true };
            const updatedQuantity = {
                $set: {...updatedQuantity}
            }
            const result = await bookCollections.updateOne(filter, updatedQuantit, options);
            res.send(result);
        });

        // //update quantity 
        // app.get('book/:id', async(req, res) => {
        //     const query = {_id: ObjectId(req.params.id)};
        //     const book = await bookCollections.findOne(query);
        //     const options = {upsert: true};
        //     if(book.quantity = 1){
        //         const result = bookCollections.deleteOne(query);
        //         res.send({delete: "deleted"})
        //     }
        //     else{
        //         const updateDoc = {
        //             $set: {
        //                ...book,
        //                quantity: book.quantity - 1
        //             }
        //         }
        //         const result = await bookCollections.updateOne(query, updateDoc, options)
        //         res.send(result);
        //     }
           
        // })

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

        //  
        // load single users items.
        app.get('/books', verifyToken,  async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            console.log(email)
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
    res.send("server Running on the heroku");
})

app.listen(port, () => {
    console.log("Server is running", port);
})