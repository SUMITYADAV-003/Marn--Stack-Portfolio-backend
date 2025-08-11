import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema({
  title:{
    type: String,
    required:true,
  },
  discription:{
    type: String,
    // required:[true, "Description is required"],
  },
  timeline: {
    from: {
      type: String,
      required: [true, "TimeLine Start Date is Required"],
    },
    to: {
      type: String,
    },
   
  },
});

export const Timeline = mongoose.model("Timeline", timelineSchema);