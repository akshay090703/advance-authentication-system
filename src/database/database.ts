import mongoose from "mongoose";
import { config } from "../config/app.config";

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Connected to Mongo DB");
  } catch (error) {
    console.log("Error connecting to Mongo DB");
    process.exit(1);
  }
};

export default connectDatabase;
