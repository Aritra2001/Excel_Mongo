const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();

//configuration          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw Error('File path not found!')
        }

        //upload file
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        //successfull fileupload
        console.log('file uploaded in cloudinary', response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove locally saved temp file 
        return error;
    }
}

module.exports = { uploadOnCloudinary }