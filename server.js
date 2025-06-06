const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Models
const Message = require('./Models/community/messages');
const BusinessDetailSignup = require('./Models/User/BusinessDetailSignup');

// Controllers
const googleauth = require('./Controllers/googleauth');
const scrapeData = require('./Controllers/microinvestments');
const filterLoansRouter = require('./Controllers/filter');
const PrivateschemesRouter = require('./Controllers/private_schemes');
const recentMessagesRoute = require('./Controllers/messageduser');

// Routes
const completeSignupRoute = require('./Routes/complete_signup');
const completeSignupRoute2 = require('./Routes/complete_signup2');
const completeSignupRoute3 = require('./Routes/complete_signup3');
const requireAuth = require('./Middlewares/authMiddleware');
const authRoutes = require('./Routes/authRoutes');
const searchRoutes = require('./Routes/searchRoutes');
const videoRoutes = require('./Routes/videosRoutes');
const pdfRoutes = require('./Routes/pdfsearchbuisness');
const communityRoutes = require('./Routes/communityAuthRoutes');
const indexRoutes = require('./Routes/index');
const getuser = require('./Routes/user');
const budgetRout = require('./BudgetPrediction/futureprediction');
const profit = require('./Routes/percentage');
const taskRoutes = require('./Routes/taskRoutes');
const { Server } = require('socket.io');
const  sixmonths= require('./BudgetPrediction/lastsixmonth')
const financialRoutes = require('./Controllers/getallloans');
const loanspayment= require('./Controllers/monthlyloanpayment')
const lasttwomonthexpands = require('./Controllers/lasttwomonthexpands')
const userprofile= require('./Routes/userProfile')
const shaktidetails= require('./Routes/shaktiProfile')

dotenv.config();

// Express app setup
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
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

  // 📩 Handle private message
  socket.on('private-message', async ({ toUserId, message }) => {
    if (!toUserId || !message) {
      return socket.emit('error', { message: 'Missing toUserId or message' });
    }

    try {
      const msg = await Message.create({
        senderId: socket.user.userId,
        receiverId: toUserId,
        message
      });

      // Emit to receiver
      io.to(toUserId).emit('private-message', {
        _id: msg._id,
        from: socket.user.userId,
        to: toUserId,
        message: msg.message,
        timestamp: msg.timestamp,
        seen: msg.seen
      });

      // Optionally emit to sender for immediate UI update
      socket.emit('private-message', {
        _id: msg._id,
        from: socket.user.userId,
        to: toUserId,
        message: msg.message,
        timestamp: msg.timestamp,
        seen: msg.seen
      });
    } catch (error) {
      console.error('❌ Failed to send private message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // ✅ Message seen
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

  // ✍️ Typing indicators
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

  // 📜 Fetch old messages
  socket.on('fetch-messages', async ({ userId }) => {
    try {
      const msgs = await Message.find({
        $or: [
          { senderId: socket.user.userId, receiverId: userId },
          { senderId: userId, receiverId: socket.user.userId }
        ]
      }).sort({ timestamp: 1 }); // Sort oldest to newest

      socket.emit('old-messages', msgs);
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error);
      socket.emit('error', { message: 'Failed to fetch messages' });
    }
  });

  // ❌ Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.user.userId}`);
  });
});

// Routes
app.use('/googleauth', googleauth);
app.use('/complete', completeSignupRoute);
app.use('/complete2', completeSignupRoute2);
app.use('/complete3', completeSignupRoute3);
app.use('/auth', authRoutes);
app.use('/filter-loans', filterLoansRouter);
app.use('/private-schemes', PrivateschemesRouter);
app.use('/search', searchRoutes);
app.use('/videos', videoRoutes);
app.use('/pdfsearch', pdfRoutes);
app.use('/community', communityRoutes);
app.use('/', indexRoutes);
app.use('/user', getuser);
app.use('/api', budgetRout);
app.use('/', profit);
app.use('/tasks', taskRoutes);
app.use('/api/recentmessages', recentMessagesRoute);
app.use('/api', sixmonths);
app.use('/api/financial', financialRoutes);
app.use('/api' ,loanspayment),
app.use('/api',lasttwomonthexpands),
app.use('/profile' ,userprofile);
app.use('/shakti',shaktidetails);



// Scraper API
app.post('/scrape', requireAuth, async (req, res) => {
  try {
    const user = req.userId;
    const business = await BusinessDetailSignup.findOne({ user });

    const location = "Ghaziabad"; // static or use business?.ideaDetails?.Buisness_City
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
