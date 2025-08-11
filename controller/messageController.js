import {catchAsyncError} from "../middlewear/cashAsyncErrors.js";
import ErrorHandler from "../middlewear/error.js";
import {Message} from "../models/messageSchema.js";

export const sendMessage = catchAsyncError(async (req, res , next) => {
  const {senderName, subject,message} = req.body;
  console.log(`this is ${senderName}, and ${subject}, and also print ${message}`);
  
  if(!senderName || !subject || !message) {
    return next(new ErrorHandler("Please Fill fUll  form ", 400));
  }
  const data = await Message.create({senderName, subject,message});
  res.status(200).json({
    success: true,
    message: "Message sent",
    date: data.createdAt,

  });
});

export const getAllMessages = catchAsyncError(async (req,res,next) => {
  const message = await Message.find();
  res.status(200).json({
    success: true,
    message,
    
  });
  return next();
  
});

export const delteMessage = catchAsyncError(async(req,res,next) => {
  const {id}  = req.params;
  const message = await Message.findById(id);
  if(!message) {
    return next(new ErrorHandler("Messages Already Delteted", 400));
  }
  await message.deleteOne();
  res.status(200).json({
    success: true,
    message: "Messges Deleted",
  });
});