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
const fileUploadRoutes = require('./Routes/fileuploadmessage');
const businessinsights = require('./Controllers/budgetai');
const expensesinsights= require('./Controllers/expensesai');
const progressinsights = require('./Controllers/progressai');


dotenv.config();

// Express app setup
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create HTTP server
const server = http.createServer(app);
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
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.user.userId}`);
  socket.join(socket.user.userId);

  // 📩 Handle private message (Enhanced)
  socket.on('private-message', async ({ toUserId, message, messageType = 'text', file, image, replyTo }) => {
    if (!toUserId || (!message && !file && !image)) {
      return socket.emit('error', { message: 'Missing required data' });
    }

    try {
      const msgData = {
        senderId: socket.user.userId,
        receiverId: toUserId,
        messageType,
        delivered: true,
        deliveredAt: new Date()
      };

      if (message) msgData.message = message;
      if (file) msgData.file = file;
      if (image) msgData.image = image;
      if (replyTo) msgData.replyTo = replyTo;

      const msg = await Message.create(msgData);
      await msg.populate('replyTo', 'message messageType file image');

      const messageResponse = {
        _id: msg._id,
        from: socket.user.userId,
        to: toUserId,
        message: msg.message,
        messageType: msg.messageType,
        file: msg.file,
        image: msg.image,
        timestamp: msg.createdAt,
        seen: msg.seen,
        delivered: msg.delivered,
        replyTo: msg.replyTo
      };

      // Emit to receiver
      io.to(toUserId).emit('private-message', messageResponse);
      
      // Emit to sender for confirmation
      socket.emit('message-sent', messageResponse);

    } catch (error) {
      console.error('❌ Failed to send private message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // ✏️ Edit message
  socket.on('edit-message', async ({ messageId, newMessage }) => {
    try {
      const message = await Message.findOne({
        _id: messageId,
        senderId: socket.user.userId
      });

      if (!message) {
        return socket.emit('error', { message: 'Message not found or unauthorized' });
      }

      // Store original message if not already stored
      if (!message.originalMessage) {
        message.originalMessage = message.message;
      }

      message.message = newMessage;
      message.edited = true;
      message.editedAt = new Date();
      await message.save();

      const editResponse = {
        messageId,
        newMessage,
        edited: true,
        editedAt: message.editedAt
      };

      // Emit to both users
      io.to(message.receiverId.toString()).emit('message-edited', editResponse);
      socket.emit('message-edited', editResponse);

    } catch (error) {
      console.error('❌ Failed to edit message:', error);
      socket.emit('error', { message: 'Failed to edit message' });
    }
  });

  // 🗑️ Delete message
  socket.on('delete-message', async ({ messageId, deleteFor = 'me' }) => {
    try {
      const message = await Message.findOne({
        _id: messageId,
        senderId: socket.user.userId
      });

      if (!message) {
        return socket.emit('error', { message: 'Message not found or unauthorized' });
      }

      if (deleteFor === 'everyone') {
        message.deleted = true;
        message.deletedAt = new Date();
        await message.save();

        // Emit to both users
        io.to(message.receiverId.toString()).emit('message-deleted', { 
          messageId, 
          deletedFor: 'everyone' 
        });
        socket.emit('message-deleted', { 
          messageId, 
          deletedFor: 'everyone' 
        });
      } else {
        // Delete for sender only
        message.deletedFor.push({
          userId: socket.user.userId
        });
        await message.save();

        socket.emit('message-deleted', { 
          messageId, 
          deletedFor: 'me' 
        });
      }

    } catch (error) {
      console.error('❌ Failed to delete message:', error);
      socket.emit('error', { message: 'Failed to delete message' });
    }
  });

  // 😊 Add reaction
  socket.on('add-reaction', async ({ messageId, emoji }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        return socket.emit('error', { message: 'Message not found' });
      }

      // Remove existing reaction from this user
      message.reactions = message.reactions.filter(
        r => r.userId.toString() !== socket.user.userId
      );

      // Add new reaction
      message.reactions.push({
        userId: socket.user.userId,
        emoji
      });

      await message.save();

      const reactionData = {
        messageId,
        userId: socket.user.userId,
        emoji,
        reactions: message.reactions
      };

      // Emit to both users
      io.to(message.receiverId.toString()).emit('reaction-added', reactionData);
      io.to(message.senderId.toString()).emit('reaction-added', reactionData);

    } catch (error) {
      console.error('❌ Failed to add reaction:', error);
      socket.emit('error', { message: 'Failed to add reaction' });
    }
  });

  // ✅ Message seen (Enhanced)
  socket.on('message-seen', async ({ fromUserId, messageIds }) => {
    try {
      const updateQuery = messageIds && messageIds.length > 0
        ? { _id: { $in: messageIds } }
        : { senderId: fromUserId, receiverId: socket.user.userId, seen: false };

      await Message.updateMany(updateQuery, { 
        $set: { 
          seen: true,
          seenAt: new Date()
        } 
      });

      io.to(fromUserId).emit('messages-seen', {
        byUserId: socket.user.userId,
        messageIds: messageIds
      });
    } catch (error) {
      console.error('❌ Failed to update seen status:', error);
    }
  });

  // ✍️ Enhanced typing indicators
  socket.on('typing', ({ toUserId }) => {
    socket.to(toUserId).emit('typing', {
      fromUserId: socket.user.userId,
      timestamp: new Date()
    });
  });

  socket.on('stop-typing', ({ toUserId }) => {
    socket.to(toUserId).emit('stop-typing', {
      fromUserId: socket.user.userId
    });
  });

  // 📜 Enhanced fetch messages
  socket.on('fetch-messages', async ({ userId, page = 1, limit = 50 }) => {
    try {
      const skip = (page - 1) * limit;
      
      const msgs = await Message.find({
        $or: [
          { senderId: socket.user.userId, receiverId: userId },
          { senderId: userId, receiverId: socket.user.userId }
        ],
        deletedFor: { 
          $not: { 
            $elemMatch: { userId: socket.user.userId } 
          } 
        }
      })
      .populate('replyTo', 'message messageType file image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

      socket.emit('old-messages', {
        messages: msgs.reverse(),
        page,
        hasMore: msgs.length === limit
      });
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error);
      socket.emit('error', { message: 'Failed to fetch messages' });
    }
  });

  // 🔍 Search messages
  socket.on('search-messages', async ({ userId, query, page = 1 }) => {
    try {
      const searchResults = await Message.find({
        $or: [
          { senderId: socket.user.userId, receiverId: userId },
          { senderId: userId, receiverId: socket.user.userId }
        ],
        message: { $regex: query, $options: 'i' },
        deleted: false,
        deletedFor: { 
          $not: { 
            $elemMatch: { userId: socket.user.userId } 
          } 
        }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * 20)
      .limit(20);

      socket.emit('search-results', {
        results: searchResults,
        query,
        page
      });
    } catch (error) {
      console.error('❌ Failed to search messages:', error);
      socket.emit('error', { message: 'Failed to search messages' });
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
app.use('/', profit)    ;
app.use('/tasks', taskRoutes);
app.use('/api/recentmessages', recentMessagesRoute);
app.use('/api', sixmonths);
app.use('/api/financial', financialRoutes);
app.use('/api' ,loanspayment),
app.use('/api',lasttwomonthexpands),
app.use('/profile' ,userprofile);
app.use('/shakti',shaktidetails);
app.use('/api/upload', fileUploadRoutes);
app.use('/api', businessinsights);
app.use('/api', expensesinsights);
app.use('/api', progressinsights);


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