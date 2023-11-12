const express = require("express")
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require("cors")
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;


// middlewares
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_KEY}@cluster0.hf0b3tt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Database Collections START
    const menusCollection = client.db("bistroBossDB").collection("menus")
    // Database Collections ENDS

    // GET menus with or without category query
    app.get("/api/v1/menus", async(req, res)=>{
        let query = {};
        if(req.query?.category){
          query = {category: req.query.category}
        }
        const result = await menusCollection.find(query).toArray()
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/", (req,res)=>{
    res.send("Bistro Boss is Running")
})

app.listen(port, ()=>{
    console.log(`Server is running on ${port}`)
})

