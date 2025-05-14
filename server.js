const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const filterLoansRouter = require('./Controllers/filter');
const PrivateschemesRouter = require('./Controllers/private_schemes');
const scrapeData = require('./Controllers/microinvestments');
const authRoutes = require('./Routes/authRoutes');
const budgetRoutes = require('./Routes/predictRoutes');
const searchRoutes = require('./Routes/searchRoutes');
const  videoRoutes = require('./Routes/videosRoutes');
const pdfRoutes= require('./Routes/pdfsearchbuisness');
dotenv.config();

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

app.use('/auth', authRoutes); 
app.use('/filter-loans', filterLoansRouter);
app.use('/private-schemes', PrivateschemesRouter);
app.use('/predict-budget', budgetRoutes);
app.use('/search',searchRoutes);
app.use('/videos',videoRoutes);
app.use('/pdfsearch',pdfRoutes);
app.post('/scrape', async (req, res) => {
  const { location } = req.body;
  
  if (!location) {
    return res.status(400).json({ error: 'Missing location in request body' });
  }

  const targetUrl = `https://www.justdial.com/${location}/Peer-To-Peer-Investment-Service-Providers/nct-11948937?stype=category_list&redirect=301`;

  try {
    const data = await scrapeData(targetUrl);
    const response = data.map(item => ({
      name: item.name,
      location: item.location,
      link: item.link,
    }));
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
