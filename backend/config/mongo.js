import mongoose from "mongoose";

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB);
    console.log("MongoDB  Connected");
  } catch (err) {
    console.error("MongoDB  Error:", err.message);
    process.exit(1);
  }
};

export default connectMongo;
