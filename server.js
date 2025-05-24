const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const Message = require('./Models/messages');
const googleauth = require('./Controllers/googleauth');
const completeSignupRoute = require('./Routes/complete_signup');
const signup2google = require('./Controllers/signupControllergoogle2')
const { signup3googleUser } = require("./Controllers/finalgooglesignup")
const requireAuth = require('./Middlewares/authMiddleware')

// Load environment variables
dotenv.config();

// Express app setup
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('No token provided'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error('Invalid token'));
  }
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.user.userId}`);
  socket.join(socket.user.userId);

  // Handle private message
  socket.on('private-message', async ({ toUserId, message }) => {
    try {
      const msg = await Message.create({
        senderId: socket.user.userId,
        receiverId: toUserId,
        message
      });

      io.to(toUserId).emit('private-message', {
        _id: msg._id,
        from: socket.user.userId,
        to: toUserId,
        message: msg.message,
        timestamp: msg.timestamp,
        seen: msg.seen
      });
    } catch (error) {
      console.error('❌ Failed to send private message:', error);
    }
  });

  // Handle message seen
  socket.on('message-seen', async ({ fromUserId }) => {
    try {
      await Message.updateMany(
        { senderId: fromUserId, receiverId: socket.user.userId, seen: false },
        { $set: { seen: true } }
      );

      io.to(fromUserId).emit('messages-seen', {
        byUserId: socket.user.userId
      });
    } catch (error) {
      console.error('❌ Failed to update seen status:', error);
    }
  });

  // Handle typing status
  socket.on('typing', ({ toUserId }) => {
    io.to(toUserId).emit('typing', {
      fromUserId: socket.user.userId
    });
  });

  socket.on('stop-typing', ({ toUserId }) => {
    io.to(toUserId).emit('stop-typing', {
      fromUserId: socket.user.userId
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.user.userId}`);
  });
});

// ---------------- API ROUTES ----------------
app.use('/googleauth', googleauth);
app.use('/complete', completeSignupRoute);
const filterLoansRouter = require('./Controllers/filter');
const PrivateschemesRouter = require('./Controllers/private_schemes');
const scrapeData = require('./Controllers/microinvestments');
const authRoutes = require('./Routes/authRoutes');
const budgetRoutes = require('./Routes/predictRoutes');
const searchRoutes = require('./Routes/searchRoutes');
const videoRoutes = require('./Routes/videosRoutes');
const pdfRoutes = require('./Routes/pdfsearchbuisness');
const communityRoutes = require('./Routes/communityAuthRoutes');
const indexRoutes = require('./Routes/index');
const BusinessDetailSignup = require('./Models/BusinessDetailSignup');

// API Routes
app.get('/', (req, res) => res.send('Welcome to the Micro Investment API'));
app.use('/auth', authRoutes);
app.use('/filter-loans', filterLoansRouter);
app.use('/private-schemes', PrivateschemesRouter);
app.use('/predict-budget', budgetRoutes);
app.use('/search', searchRoutes);
app.use('/videos', videoRoutes);
app.use('/pdfsearch', pdfRoutes);
app.use('/community', communityRoutes);
app.use('/', indexRoutes);

// Scraping route
app.post('/scrape', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const business = await BusinessDetailSignup.findOne({ user });

    if (!business || !business.ideaDetails?.Buisness_City) {
      return res.status(400).json({ error: 'Missing business city in user profile' });
    }

    const location = business.ideaDetails.Buisness_City;
    const targetUrl = `https://www.justdial.com/${location}/Peer-To-Peer-Investment-Service-Providers/nct-11948937?stype=category_list&redirect=301`;
    const data = await scrapeData(targetUrl);

    const response = data.map(item => ({
      name: item.name,
      location: item.location,
      link: item.link,
    }));

    res.json(response);
  } catch (err) {
    console.error('❌ Scraping failed:', err);
    res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
