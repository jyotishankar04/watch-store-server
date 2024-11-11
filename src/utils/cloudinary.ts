import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { Config } from "../config/config";

cloudinary.config({
  cloud_name: Config.CLOUDINARY_CLOUD_NAME,
  api_key: Config.CLOUDINARY_API_KEY,
  api_secret: Config.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath: string, folder?: string) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: folder || "justwatchtemp",
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteOnCloudinary = async (publicId: string) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    return null;
  }
};

const deleteMultipleOnCloudinary = async (publicIds: string[]) => {
  try {
    return await cloudinary.api.delete_resources(publicIds);
  } catch (error) {
    return null;
  }
};

export { uploadOnCloudinary, deleteOnCloudinary, deleteMultipleOnCloudinary };
export default cloudinary;
