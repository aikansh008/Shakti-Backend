const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path'); // ✅ ADD THIS LINE

// Load environment variables
dotenv.config();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('Mongo Error:', err));

// Use routes
const signupRoutes = require('./Routes/signupRoutes');
app.use('/api/signup', signupRoutes);

// Import authRoutes correctly (not loginUser directly)
const authRoutes = require('./Routes/authRoutes');
app.use('/api/auth', authRoutes);
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

const getdetailsRoutes = require('./Routes/searchRoutes'); 
app.use('/api/search', getdetailsRoutes); 

const pdfResults = require('./Routes/pdfsearchbuisness'); 
app.use('/api/pdfs', pdfResults);

const youtubeSearchRoute = require('./Routes/videosRoutes');
app.use('/api/youtube', youtubeSearchRoute);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
