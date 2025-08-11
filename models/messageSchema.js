import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderName:{
    type: String,
    minLength: [2, "Name must contanin at least 2 character! "],
  },
  subject:{
    type: String,
    minLength: [2, "Subject must contanin at least 2 character! "],
  },
  message:{
    type: String,
    minLength: [2, "Message must contanin at least 2 character! "],
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },

});

export const Message = mongoose.model("Message", messageSchema);