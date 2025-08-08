
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
export const CLOUDINARY_CLOUD_NAME  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const BASE_URL = 'https://medisync-x6xn.onrender.com'; 

export const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
export const DEFAULT_AVATAR = "https://www.w3schools.com/howto/img_avatar.png"; 
export const ADMIN_SECRET=  import.meta.env.ADMIN_SECRET;
export const  GENERATIVE_AI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + import.meta.env.VITE_GEMINI_API_KEY;


 
