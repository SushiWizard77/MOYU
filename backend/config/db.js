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

    // Never kill the process: a transient database outage should fail individual
    // requests with a 500, not take the whole API down. `isConnected` stays false,
    // so the next request (or cold start) retries the connection.
    throw error;
  }
};

module.exports = connectDB;