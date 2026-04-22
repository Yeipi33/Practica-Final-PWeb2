import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Sube un buffer de imagen a Cloudinary
export const uploadToCloudinary = async (buffer, folder, filename) => {
    const optimized = await sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer()

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder,
            public_id: filename,
            resource_type: 'image',
        },
        (error, result) => {
            if (error) reject(error)
            else resolve(result)
        })
        stream.end(optimized)
    })
}

// Sube un PDF a Cloudinary
export const uploadPdfToCloudinary = async (buffer, folder, filename) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: filename,
                resource_type: 'raw'
            },
            (error, result) => {
                if (error) reject(error)
                else resolve(result)
            }
        )
        stream.end(buffer)
    })
}