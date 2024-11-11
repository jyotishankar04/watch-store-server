import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "djby1yfko",
  api_key: "523555972596923",
  api_secret: "<your_api_secret>", // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return Error("No file found");
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return Error("Something went wrong");
  }
};

export { uploadOnCloudinary };
export default cloudinary;
