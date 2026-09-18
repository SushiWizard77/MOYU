const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);

    console.log(`🍃 MongoDB connected: ${connection.connection.host}`);
    isConnected = true;
    return connection;
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error(error.message);

    // On Vercel (serverless) never kill the process — just throw
    // so the request handler can return a 500 instead.
    if (process.env.VERCEL) {
      throw error;
    }
    process.exit(1);
  }
};

module.exports = connectDB;