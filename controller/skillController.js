import { catchAsyncError } from "../middlewear/cashAsyncErrors.js";
import ErrorHandler from "../middlewear/error.js";
import {Skill} from "../models/skilSchema.js";
import { v2 as cloudinary } from "cloudinary";



export const addNewSkill = catchAsyncError(async(req,res,next) => {
  if(!req.files || Object.keys(req.files).length === 0){
    return next(new ErrorHandler("Skill Svg Required!:", 400));
  }
  const { svg } = req.files;
  const { title, proficiency,} = req.body;
  if(!title || !proficiency){
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }
  const cloudinaryRespone = await cloudinary.uploader.upload(svg.tempFilePath, {folder: "PORTFOLIO_SKILL_SVGS"});
  if(!cloudinaryRespone || cloudinaryRespone.error) {
    console.error("Cloudinary Error: ", cloudinaryRespone.error || "Unknown Cloudinary Error");
  }

  const skill = await Skill.create({
    title,
    proficiency,
    svg: {
      public_id: cloudinaryRespone.public_id,
      url: cloudinaryRespone.secure_url,
    },
  });
  res.status(200).json({
    success: true,
    message: "New Skill Added",
    skill,
  })

});

export const deleteSkill = catchAsyncError(async(req,res,next) => {
  const {id} = req.params;
  const skill = await Skill.findById(id);
  if(!skill){
    return next(new ErrorHandler("Skill  Not Found", 404));
  }
  const skillsvgId = skill.svg.public_id;
  await cloudinary.uploader.destroy(skillsvgId);
  await skill.deleteOne();

  res.status(200).json({
    success: true,
    message: "skill are Deleted!",
  });
});

export const updateSkill = catchAsyncError(async(req,res,next) => {
  const {id} = req.params;
  let skill = await Skill.findById(id);
  if(!skill){
    return next(new ErrorHandler("Skill  Not Found", 404));
  }
  let {proficiency} = req.body;
  skill = await Skill.findByIdAndUpdate(
    id,
    {proficiency},
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
    
  );
  res.status(200).json({
    success: true,
    message: "Skill Updated now",
    skill,
  });
});


export const getAllSkills = catchAsyncError(async(req,res,next) => {
  const skills = await Skill.find();
  res.status(200).json({
    success: true,
    skills,
  });
});
