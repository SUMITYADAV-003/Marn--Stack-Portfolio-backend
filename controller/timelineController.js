import { catchAsyncError } from "../middlewear/cashAsyncErrors.js";
import { Timeline}  from "../models/timelineSchema.js";
import ErrorHandler from "../middlewear/error.js";


export const postTimeline = catchAsyncError(async(req,res , next)=>{
  const {title,discription,from,to} = req.body;
  const newTimeline = await Timeline.create({
    title,
    discription,
    timeline:{
      from,
      to,
    },
  });
  res.status(200).json({
    success: true,
    message: "Timeline Added",
    newTimeline,
  })
});


export const deleteTimeline = catchAsyncError(async(req,res , next)=>{
  const {id} = req.params;
  const timeline = await Timeline.findById(id);
  if(!timeline){
    return next(new ErrorHandler("Timeline Not Found", 400));
  }
  await timeline.deleteOne();
  res.status(200).json({
    success: true,
    message: "Timeline Deleted!",
  });
    

  
});
export const getAllTimelines = catchAsyncError(async(req,res , next)=>{
  const timeline = await Timeline.find();
  res.status(200).json({
    success: true,
    timeline,
  });
});
