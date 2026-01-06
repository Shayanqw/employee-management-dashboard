require('dotenv').config();
const { app } = require('./app');
const { connectDB } = require('./db');

async function start() {
  const uri = process.env.MONGO_URI || 'mongodb://mongodb:27017/employee_management';

  try {
    await connectDB(uri);
    console.log('MongoDB connected');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
