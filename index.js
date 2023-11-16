const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_KEY}@cluster0.hf0b3tt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Database Collections START
    const menusCollection = client.db("bistroBossDB").collection("menus");
    const cartsCollection = client.db("bistroBossDB").collection("carts");
    const usersCollection = client.db("bistroBossDB").collection("users");
    // Database Collections ENDS

    // GET cart with user email query
    app.get("/api/v1/carts", async (req, res) => {
      const query = { userEmail: req?.query?.email };
      const result = await cartsCollection.find(query).toArray();
      res.send(result);
    });

    // POST an item into cart
    app.post("/api/v1/carts", async (req, res) => {
      const cart = req?.body;
      const result = await cartsCollection.insertOne(cart);
      res.send(result);
    });

    // DELETE an item from cart
    app.delete("/api/v1/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartsCollection.deleteOne(query);
      res.send(result);
    });

    // GET menus with or without category query
    app.get("/api/v1/menus", async (req, res) => {
      let query = {};
      if (req.query?.category) {
        query = { category: req.query.category };
      }
      const result = await menusCollection.find(query).toArray();
      res.send(result);
    });

    // GET all the users
    app.get("/api/v1/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // POST an user when registered
    app.post("/api/v1/users", async (req, res) => {
      const user = req?.body;
      // check if user already exists
      const query = { email: user?.email };
      const isExist = await usersCollection.findOne(query);
      if (isExist) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // PATCH: update users role to admin
    app.patch("/api/v1/users/:id", async (req, res) => {
      const id = req?.params.id;
      const usersRole = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: usersRole.role,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // DELETE an user from database
    app.delete("/api/v1/users/:id", async (req, res) => {
      const id = req?.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Bistro Boss is Running");
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
