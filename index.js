import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");
import { MongoClient } from "mongodb";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { routerAccount } = require('./routes/accounts');

const MONGO_URI_LOCAL = "mongodb://127.0.0.1:27017/signups-testing";
// const MONGO_URI_CLOUD = "mongodb+srv://ashuarena:arenaashu@cluster0.teyrnb7.mongodb.net/my-academy?retryWrites=true&w=majority&appName=Cluster0";

/*** FOR MIGRATION ONLY
 * 
 */
// const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.teyrnb7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// const localUri = MONGO_URI_LOCAL;
// const cloudUri = MONGO_URI_CLOUD;

// const migrate = async () => {
//   const localClient = new MongoClient(localUri);
//   const cloudClient = new MongoClient(cloudUri);

// try {
//   await localClient.connect();
//   await cloudClient.connect();

//   const localDB = localClient.db("my-academy");
//   const cloudDB = cloudClient.db("my-academy");

//   const collections = await localDB.listCollections().toArray();

//   const data = await localDB.collection("users").find().toArray();
//   for (const { name } of collections) {
//     console.log(`Migrating collection: ${name}`);

//     const data = await localDB.collection(name).find().toArray();

//     if (data.length > 0) {
//       await cloudDB.collection(name).deleteMany({}); // Optional: clear target first
//       await cloudDB.collection(name).insertMany(data);
//       console.log(`✅ Migrated ${data.length} documents to "${name}"`);
//     } else {
//       console.log(`⚠️ Collection "${name}" is empty. Skipped.`);
//     }
//   }

//   console.log("🎉 Migration complete!");
//   } catch (err) {
//     console.error("❌ Migration failed:", err);
//   } finally {
//     await localClient.close();
//     await cloudClient.close();
//   };
// }

// migrate();

/*

*****/

// ✅ Fix: Set a proper connection timeout
// mongoose
//   .connect(MONGO_URI_LOCAL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     serverSelectionTimeoutMS: 5000, // ⏳ Wait 5 sec before failing
//     connectTimeoutMS: 10000, // ⏳ Timeout after 10 sec
//   })
//   .then(() => {
//     console.log("✅ MongoDB Connected");
//   })
//   .catch((err) => {
//     console.error("❌ MongoDB Connection Error:", err);
//   });

mongoose.connect(MONGO_URI_LOCAL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected:", mongoose.connection.name);
})
.catch(err => {
  console.error("❌ Connection error:", err);
});

  app.use(
    cors({
      origin: function (origin, callback) {
        callback(null, origin || true); // Allow all origins dynamically
      },
      credentials: true,
    }),
  );
  

const port = 3001;

app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

console.log(mongoose.connection.name); 

app.use("/api/account", routerAccount);

app.listen(port, () => {
  console.log("Listening on 3001");
});
