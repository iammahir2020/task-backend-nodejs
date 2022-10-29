const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// function to verify JWT token
function verifyJwtToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const jwtAccessToken = authHeader.split(" ")[1];
  jwt.verify(jwtAccessToken, process.env.JWT_ACCESSTOKEN, (error, decoded) => {
    if (error) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    req.decoded = decoded;
    next();
  });
}

// connecting to mongodb database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cdrl5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const contactsCollection = client.db("backend").collection("contacts");

    // Route to generate JWT token
    app.get("/getJWTtoken", async (req, res) => {
      const jwtAccessToken = jwt.sign(
        { user: "Vouch Digital" },
        process.env.JWT_ACCESSTOKEN,
        {
          expiresIn: "1d",
        }
      );
      res.send({ jwtAccessToken });
    });

    // get list of contacts based on pagination infomation (which page user is seeing=>page,number of contacts user wants to see=>size)
    app.get("/contactBulk", async (req, res) => {
      const page = parseInt(req.query.page);
      const count = parseInt(req.query.size);
      let mysort = { name: 1 };
      let contacts;
      if (page || count) {
        contacts = await contactsCollection
          .find()
          .sort(mysort)
          .skip(page * count)
          .limit(count)
          .toArray();
      } else {
        contacts = await contactsCollection.find().sort(mysort).toArray();
      }

      res.send(contacts);
    });

    // get single contact (passing id as query)
    app.get("/contact", async (req, res) => {
      const contactId = req.query.id;
      const query = { _id: ObjectId(contactId) };
      const contact = await contactsCollection.findOne(query);
      res.send(contact);
    });

    // get phase matching results (matching name)
    app.get("/searchByName", async (req, res) => {
      const name = req.query.name;
      const contact = await contactsCollection
        .find({ name: { $regex: name } })
        .toArray();
      res.send(contact);
    });

    // get number of contacts for creating pages for pagination
    app.get("/contactCount", async (req, res) => {
      const count = await contactsCollection.estimatedDocumentCount();
      res.send({ count });
    });

    // add a new contact
    app.post("/contact", async (req, res) => {
      const contact = req.body;
      const result = await contactsCollection.insertOne(contact);
      res.send(result);
    });

    // add bulk contacts
    app.post("/contactBulk", async (req, res) => {
      const contacts = req.body;
      const options = { ordered: true };
      const result = await contactsCollection.insertMany(contacts, options);
      res.send(result);
    });

    // update specific contact (presuming there are three properties (name,email,number) for each contact)
    app.put("/contact", async (req, res) => {
      const { name, email, number, _id } = req.body;
      const filter = { _id: ObjectId(_id) };
      const updateDoc = {
        $set: {
          name: name,
          email: email,
          number: number,
        },
      };
      const result = await contactsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // delete specific contact
    app.delete("/contact", async (req, res) => {
      const contactId = req.query.id;
      const query = { _id: ObjectId(contactId) };
      const result = await contactsCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("BackEnd Server is LIVE!");
});

app.listen(port, () => {
  console.log("Listening to port", port);
});
