import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) {
            throw new Error("File path is required for uploading to Cloudinary");
        }
        //upload the file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // it will automatically detect the type of the file and upload it accordingly
        })
        // file has been uploaded successfully
        console.log("File uploaded to Cloudinary successfully:",response.url);
        // After uploading the file to Cloudinary, we can delete the local file to save space on the server
        return response; // The response will contain the URL of the uploaded file and other details

    } catch (error) {
        fs.unlinkSync(localFilePath); // Remove the local file in case of an error during upload
        console.error("Error uploading file to Cloudinary:", error);
        return null;
    }
}

export  {uploadOnCloudinary};
    