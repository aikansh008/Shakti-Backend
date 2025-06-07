// POST /api/message/conversation
const Conversation = require('../Models/community/conversation');
const Message = require('../Models/community/messageold');



const startConversation = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.userId;

  try {
    // Check if a conversation already exists
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({ members: [senderId, receiverId] });
      await conversation.save();
    }

    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json({ message: "Failed to create/get conversation", error: err });
  }
};


// POST /api/message/send


const sendMessage = async (req, res) => {
  const { conversationId, text, messageType } = req.body;
  const sender = req.userId;
  const fileUrl = req.file?.path;

  try {
    const message = new Message({
      conversationId,
      sender,
      text,
      file: fileUrl,
      messageType: fileUrl ? messageType : 'text',
    });

    await message.save();

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text || '[Media]',
      updatedAt: Date.now()
    });

    res.status(200).json(message);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message", error: err });
  }
};


// GET /api/message/:conversationId
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages", error: err });
  }
};


module.exports={
  startConversation,
  sendMessage,
  getMessages,
}