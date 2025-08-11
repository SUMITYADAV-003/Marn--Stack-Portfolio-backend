import { catchAsyncError } from "../middlewear/cashAsyncErrors.js";
import ErrorHandler from "../middlewear/error.js";
import { softwareApplication } from '../models/softwareApplicationSchema.js';
import { v2 as cloudinary } from "cloudinary";

export const addNewApplication = catchAsyncError(async(req, res, next) => {
  if(!req.files || Object.keys(req.files).length === 0){
    return next(new ErrorHandler("Softerware Application Icon/Svg Required!:", 400));
  }
  const { svg } = req.files;
  const { name } = req.body;
  if(!name){
    return next(new ErrorHandler("Software's Name Is Required;", 400));
  }
  const cloudinaryRespone = await cloudinary.uploader.upload(svg.tempFilePath, {folder: "PORTFOLIO_SOFTWARE_APPLICATIONS"});
  if(!cloudinaryRespone || cloudinaryRespone.error) {
    console.error("Cloudinary Error: ", cloudinaryRespone.error || "Unknown Cloudinary Error");
  }
  
  // Change the variable name here to avoid conflict with the imported model
  const newSoftwareApp = await softwareApplication.create({
    name,
    svg: {
      public_id: cloudinaryRespone.public_id,
      url: cloudinaryRespone.secure_url,
    },
  });
  
  res.status(200).json({
    success: true,
    message: "New Software Application Added!",
    softwareApplication: newSoftwareApp,
  })
});

export const deleteApplication = catchAsyncError(async(req, res, next) => {
  const {id} = req.params;
  const appDelete = await softwareApplication.findById(id);
  if(!appDelete){
    return next(new ErrorHandler("Software Application Not Found", 404));
  }
  const softwareApplicationSvgId = appDelete.svg.public_id;
  await cloudinary.uploader.destroy(softwareApplicationSvgId);
  await appDelete.deleteOne();

  res.status(200).json({
    success: true,
    message: "software Appliction Deleted!",
  });
});

export const getAllApplication = catchAsyncError(async(req, res, next) => {
  const softwareApplications = await softwareApplication.find();
  res.status(200).json({
    success: true,
    softwareApplications,
  })
})