// ✅ 1. Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

// ✅ 2. Configure Cloudinary here (before importing other modules that use it)
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// console.log("✅ Cloudinary config loaded:", {
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY ? "✅" : "❌",
//   api_secret: process.env.CLOUDINARY_API_SECRET ? "✅" : "❌"
// });

import connectDB from './db/index.js';
import { app } from './app.js';

// ✅ 4. Connect to MongoDB and start server
connectDB()
  .then(() => {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`✅ Server is running at port: ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed!", err);
  });


// Your other middleware/routes here
//import { DB_NAME } from "./constants";
// import express from "express"
// const app = express()
// (async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error", (error)=>{
//             console.log("ERROR: ", error);
//             throw error
//         })
//         app.listen(process.env.PORT , ()=>{
//             console.log(`App is listening on port ${process.env.PORT}`);
//         })
//     } catch (error) {
//         console.error("ERROR: ", error)
//     }
// })()