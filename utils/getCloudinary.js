import { v2 as cloudinary } from "cloudinary";

const getCloudinary = function () {
  // Primero, verifica si ya está configurado
  if (cloudinary.config().cloud_name) {
    return cloudinary;
  }

  // Si CLOUDINARY_URL está presente, configúralo usando URL
  if (process.env.CLOUDINARY_URL) {
    try {
      const cloudinaryUrl = new URL(process.env.CLOUDINARY_URL);
      const config = {
        cloud_name: cloudinaryUrl.hostname,
        api_key: cloudinaryUrl.username,
        api_secret: cloudinaryUrl.password,
      };

      cloudinary.config(config);
      return cloudinary;
    } catch (error) {
      console.error("Error configurando Cloudinary:", error);
    }
  }

  // Alternativa: Usar variables de entorno separadas
  if (
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET
  ) {
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };

    cloudinary.config(config);
    return cloudinary;
  }

  // Si no hay configuración, lanza un error
  throw new Error("Cloudinary configuration not found. Please set CLOUDINARY_URL or individual environment variables.");
};

export default getCloudinary;