const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const filterLoansRouter = require('./Controllers/filter');
const PrivateschemesRouter = require('./Controllers/private_schemes');
const scrapeData = require('./Controllers/microinvestments'); // Adjust the path if necessary
dotenv.config();

// Initialize Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// General API routes
const routes = require('./Routes/index');
app.use('/', routes);

// Route for Gemini loan filtering
app.use('/filter-loans', filterLoansRouter);  
// Avoid path collisions
app.use('/private-schemes', PrivateschemesRouter);
app.post('/scrape', async (req, res) => {
  const { location } = req.body;
  
  if (!location) {
    return res.status(400).json({ error: 'Missing location in request body' });
  }

  // Construct the URL dynamically using the location
  const targetUrl = `https://www.justdial.com/${location}/Peer-To-Peer-Investment-Service-Providers/nct-11948937?stype=category_list&redirect=301`;

  try {
    const data = await scrapeData(targetUrl);

    const response = data.map(item => ({
      name: item.name,  // Name of the service provider
      location: item.location,  // Location of the service provider
      link: item.link,  // Link to the service provider
    }));

    res.json(response);  // Return the full response with all details
  } catch (err) {
    res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
