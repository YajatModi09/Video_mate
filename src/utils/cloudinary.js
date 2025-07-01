import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from 'dotenv';
dotenv.config();
// Configure cloudinary (env must be loaded in index.js before this file is imported)
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// console.log("Loaded Cloudinary config:", {
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY ? "✅ Loaded" : "❌ Missing",
//   api_secret: process.env.CLOUDINARY_API_SECRET ? "✅ Loaded" : "❌ Missing"
// });

// Upload function
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });

    console.log("✅ File uploaded to Cloudinary:", response.url);

    // Remove local file after successful upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error.message);

    // Remove temp file if upload fails
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

export { uploadOnCloudinary };
