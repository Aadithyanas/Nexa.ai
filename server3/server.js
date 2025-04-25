
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'
import bodyParser from 'body-parser';
import Chat from './models/Chat.js'; 
import MongoDB from './config/Db.config.js';
// Initialize Express app
const app = express();
app.use(cors())
// Middleware to parse JSON data
app.use(bodyParser.json());

MongoDB()

// Route to save chat data
app.post('/save-chat', async (req, res) => {
    const { user_id, session_id, message, response } = req.body;
  
    try {
      const chat = await Chat.create({ user_id, session_id, message, response });
      res.status(200).json({ message: 'Chat saved successfully!', chat });
    } catch (err) {
      res.status(500).json({ error: 'Error saving chat' });
    }
  });
  // Get session list per user
app.get('/sessions/:user_id', async (req, res) => {
    try {
      const sessions = await Chat.aggregate([
        { $match: { user_id: req.params.user_id } },
        {
          $group: {
            _id: '$session_id',
            firstMessage: { $first: '$message' },
            timestamp: { $first: '$timestamp' },
          },
        },
        { $sort: { timestamp: -1 } }
      ]);
      res.status(200).json({ sessions });
    } catch (err) {
      res.status(500).json({ error: 'Error fetching sessions' });
    }
  });
  
app.get('/session/:session_id',async(req,res)=>{

  const sessionId=req.params.session_id;
  console.log(sessionId)
  try {
    const chats = await Chat.find({ session_id: sessionId }).sort({ timestamp: 1 });

    if (chats.length === 0) {
      res.status(200).json({ message: 'No chat history available.' });
  } else {
      res.status(200).json({ chats });
  }

  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat history' });
  }

})
  

// Route to get chat history for a specific user
app.get('/get-chat/:user_id', async (req, res) => {
    const user_id = req.params.user_id;

    try {
        const chats = await Chat.find({ user_id }).sort({ timestamp: 1 }); // Sort by timestamp (ascending)
        if (chats.length === 0) {
            res.status(200).json({ message: 'No chat history available.' });
        } else {
            res.status(200).json({ chats });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error fetching chat history' });
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
