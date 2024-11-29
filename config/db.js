const mongoose = require('mongoose');

// MongoDB connection setup
const connectDB = async () => {
    // console.log(process.env.MONGODB_URI);
  try {
    await mongoose.connect(process.env.MONGODB_URI, {});
    console.log('MongoDB Connected successfully 🚀');
  } catch (error) {
    console.error('MongoDB connection failed ❌', error);
    process.exit(1); // Exit process if connection fails
  }
};

module.exports = connectDB;
