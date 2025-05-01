import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'
import bodyParser from 'body-parser';
import Chat from './models/Chat.js'; 
import MongoDB from './config/Db.config.js';
import LRUCache from './lruCache.js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Express app
const app = express();
app.use(cors())
// Middleware to parse JSON data
app.use(bodyParser.json());

MongoDB()

const sessionCache = new LRUCache(parseInt(process.env.SESSION_CACHE_SIZE || '100'));

// Route to save chat data
app.post('/save-chat', async (req, res) => {
    const { user_id, session_id, message, response } = req.body;
  
    try {
      const chat = await Chat.create({ user_id, session_id, message, response });
      
      let cached = sessionCache.get(session_id);
      if (!cached) cached = [];
      cached = [
        ...cached,
        { message, response, user_id, session_id, timestamp: new Date() }
      ];
      sessionCache.set(session_id, cached);
      res.status(200).json({ message: 'Chat saved successfully!', chat });
    } catch (err) {
      res.status(500).json({ error: 'Error saving chat' });
    }
  });
  
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
  app.post('/sessions', (req, res) => {
    const session_id = uuidv4();
    res.status(200).json({ session: { _id: session_id, firstMessage: '', timestamp: new Date() } });
  });
  
app.get('/session/:session_id',async(req,res)=>{

  const sessionId=req.params.session_id;
  
  const cached = sessionCache.get(sessionId);
  if (cached) {
    console.log(`[CACHE HIT] Session ${sessionId} served from cache.`);
    return res.status(200).json({ chats: cached, cached: true });
  }
  try {
    const chats = await Chat.find({ session_id: sessionId }).sort({ timestamp: 1 });
    console.log(`[CACHE MISS] Session ${sessionId} fetched from MongoDB.`);
    if (chats.length === 0) {
      res.status(200).json({ message: 'No chat history available.' });
  } else {
      sessionCache.set(sessionId, chats); // Store in cache
      res.status(200).json({ chats, cached: false });
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

// Debug endpoint to view current cache contents
app.get('/debug/cache', (req, res) => {
  res.json({
    cache: sessionCache.toArray(),
    size: sessionCache.cache.size,
    maxSize: sessionCache.maxSize
  });
});

// Endpoint to clear all cache
app.post('/debug/clear-cache', (req, res) => {
  sessionCache.clear();
  res.json({ message: 'Cache cleared.' });
});

// Endpoint to delete all chats for a session and remove it from the cache
app.delete('/session/:session_id', async (req, res) => {
  const sessionId = req.params.session_id;
  try {
    await Chat.deleteMany({ session_id: sessionId });
    sessionCache.delete(sessionId);
    res.status(200).json({ message: 'Session deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting session.' });
  }
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
