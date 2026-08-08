import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const generateSignature = (publicId) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, public_id: publicId },
    cloudinary.config().api_secret
  );
  return { timestamp, signature, cloudName: cloudinary.config().cloud_name, apiKey: cloudinary.config().api_key };
};

export const getUploadUrl = (folder = 'taleemxpress') => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(params, cloudinary.config().api_secret);
  return {
    url: `https://api.cloudinary.com/v1_1/${cloudinary.config().cloud_name}/auto/upload`,
    params: {
      timestamp,
      folder,
      signature,
      api_key: cloudinary.config().api_key,
    },
  };
};

export default cloudinary;
