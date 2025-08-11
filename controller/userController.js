import { catchAsyncError } from "../middlewear/cashAsyncErrors.js";
import ErrorHandler from "../middlewear/error.js";
import { User } from "../models/userSchema.js";
import {v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/twtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

export const register = catchAsyncError(async(req, res , next) => {
  if(!req.files || Object.keys(req.files).length === 0){
    return next(new ErrorHandler("Avator and Resume are Required!:", 400));
  }
  const {avatar } = req.files;
  console.log("avatar" ,avatar);


  const cloudinaryResponerForAvatar = await cloudinary.uploader.upload(avatar.tempFilePath, {folder: "AVATARS"});

  if(!cloudinaryResponerForAvatar || cloudinaryResponerForAvatar.error) {
    console.error("Cloudinary Error: ", cloudinaryResponerForAvatar.error || "Unknow Cloudinary Error");
  }

  const {resume} = req.files;
  console.log("RESume", resume);
  
  const cloudinaryResponerForResume = await cloudinary.uploader.upload(resume.tempFilePath, {folder: "MY_RESUME"});

  if(!cloudinaryResponerForResume || cloudinaryResponerForResume.error) {
    console.error("Cloudinary Error: ", cloudinaryResponerForResume.error || "Unknow Cloudinary Error");
  }


  const {
  fullName,
  email,
  phone,
  aboutMe,
  password,
  githubURL,
  portfolioURL,
  instagramURL,
  linkedInURL,
  facebookURL,
  twitterURl } = req.body;

  const user = await User.create({
  fullName,
  email,
  phone,
  aboutMe,
  password,
  githubURL,
  portfolioURL,
  instagramURL,
  linkedInURL,
  twitterURl,
  facebookURL,
  avatar: {
    public_id: cloudinaryResponerForAvatar.public_id,
    url: cloudinaryResponerForAvatar.secure_url,
  },
  resume: {
    public_id: cloudinaryResponerForResume.public_id,
    url: cloudinaryResponerForResume.secure_url,
  },
    
  });
  generateToken(user, "user Register!", 201, res);
});

export const login = catchAsyncError(async (req,res,next) => {
  const {email,password} = req.body;
  // console.log(`Attempting login for email ${email}`);

  try{
    const user = await User.findOne({email}).select("+password");
    console.log("user found", !!user);
    
  } catch(error){
    console.error("Database error:", error);
    return next(new ErrorHandler("Database error", 500));
    
  }
  


  if(!email || !password){
    return next(new ErrorHandler("Email And Password Are Required!"));
  }
  const user = await User.findOne({email}).select("+password");
  if(!user){
    return next(new ErrorHandler("Invalid Email or Password!"));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if(!isPasswordMatched){
    return next(new ErrorHandler("Invalid Email or Password"));
  }
  generateToken(user, "Logged In ", 200, res);
});

export const logout = catchAsyncError(async(req,res,next) => {
  res
  .status(200)
  .cookie("token","", {
    expires: new Date(Date.now()),
    httpOnly: true,
  })
  .json({
    success:true,
    messageL: "Logged Out",
  });
});

export const getUser = catchAsyncError(async (req,res,next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = catchAsyncError(async (req,res,next) => {
  const newUserdata = {
    fullName:      req.body.fullName,
    email:         req.body.email,
    phone:         req.body.phone,
    aboutMe:       req.body.aboutMe,
    githubURL:     req.body.githubURL,
    portfolioURL:  req.body.portfolioURL,
    instagramURL:  req.body.instagramURL,
    linkedInURL:   req.body.linkedInURL,
    twitterURL:    req.body.twitterURL,
    facebookURL:    req.body.facebookURL,
  };
  if(req.files && req.files.avatar){
    const avatar = req.files.avatar;
    const user = await User.findById(req.user._id);
    const profileImageId = user.avatar.public_id;
    await cloudinary.uploader.destroy(profileImageId);
    const cloudinaryResponer = await cloudinary.uploader.upload(avatar.tempFilePath,
       {folder: "AVATARS"}
    );
    newUserdata.avatar = {
      public_id: cloudinaryResponer.public_id,
      url: cloudinaryResponer.secure_url,
     };
   }
   
   if(req.files && req.files.resume){
    const resume = req.files.resume;
    const user = await User.findById(req.user._id);
    const resumeId = user.resume.public_id;
    await cloudinary.uploader.destroy(resumeId);
    const cloudinaryResponer = await cloudinary.uploader.upload(resume.tempFilePath,
     {folder: "MY_RESUME"}
    );
    newUserdata.resume = {
      public_id: cloudinaryResponer.public_id,
      url: cloudinaryResponer.secure_url,
     };
   }
  

   const user = await User.findByIdAndUpdate(req.user.id, newUserdata, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
   });
   res.status(200).json({
    success: true,
    message: "Profile Updated!",
    user,
   });

});

export const updatePassword = catchAsyncError(async(req,res,next) => {
  const {currentPassword, newPassword, confirmNewPassword} = req.body;
  
  if(!currentPassword || !newPassword || !confirmNewPassword){
    return next(new ErrorHandler("Please Fill All Fields : ", 400));
  }
  const user = await User.findById(req.user.id).select("+password");
  const isPasswordMatched = await user.comparePassword(currentPassword);
  if(!isPasswordMatched){
    return next(new ErrorHandler("Incorrect current Password", 400));
  }
  if(newPassword !== confirmNewPassword){
    return next(
      new ErrorHandler("New Password And confirm New Password Do Not Match", 400)
    );
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password Update!",
  });

});



 
export  const getUserForPortfolio = catchAsyncError(async (req,res,next) => {
  const id = "68955764ea4bd266d352c099";
  const user = await User.findById(id);
  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = catchAsyncError(async (req,res,next) => {
  const user = await User.findOne({email: req.body.email});
  if(!user) {
    return next( new ErrorHandler("User Not Found!", 404));
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;
  const message = `Your Reset Password Token is:- \n \n${resetPasswordUrl} \n\n If you've request for this please ignore it.  `;

  try{
    await sendEmail({
      email: user.email,
      subject: "Personel Portfolio Dashboad Recovery Password",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email send to ${user.email} successfully!`
    });

  } catch(error){
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save();
    return next(new ErrorHandler(error.message, 500));

  }
});

export const resetPassword = catchAsyncError(async(req,res,next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
  .createHash("sha256")
  .update(token)
  .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {$gt: Date.now()},
  });
  if(!user) {
    return next(
      new ErrorHandler(
        "Reset password token is invalide or has been expired: ",
        400
      )

    );
  }
  if(req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password & confirm Password Do Not Match."));
  }
  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;
  await user.save();
  generateToken(user, "Reset Password Successfully ", 200, res);
});