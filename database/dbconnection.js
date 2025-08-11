import mongoose, { connect } from "mongoose";

const dbConnection = ()=>{
  mongoose.connect(process.env.MONGO_URI, {
    dbName: "PORTFOLIO",
  })
  .then(()=> {
    console.log("connect to database");
  })
  .catch((error)=> {
    console.log(`somting want wrong", ${error}`);
    
  })
};

export default dbConnection;