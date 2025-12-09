// import mongoose from "mongoose";

// const connectDB = async () => {
//   mongoose.connection.on("connected", () => {
//     console.log("Db Connected");
//   });
//   await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`)
// };
// export default connectDB

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB Connected Successfully");
  } catch (error) {
    console.error("DB Connection Error:", error);
  }
};

export default connectDB;
