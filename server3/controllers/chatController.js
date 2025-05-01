import Chat from '../models/Chat.js';
import LRUCache from '../lruCache.js';
import { v4 as uuidv4 } from 'uuid';

const sessionCache = new LRUCache(parseInt(process.env.SESSION_CACHE_SIZE || '100'));

export const saveChat = async (req, res) => {
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
};

export const getSessions = async (req, res) => {
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
};

export const createSession = (req, res) => {
  const session_id = uuidv4();
  res.status(200).json({ session: { _id: session_id, firstMessage: '', timestamp: new Date() } });
};

export const getSessionChats = async (req, res) => {
  const sessionId = req.params.session_id;
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
      sessionCache.set(sessionId, chats);
      res.status(200).json({ chats, cached: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat history' });
  }
};

export const getUserChats = async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const chats = await Chat.find({ user_id }).sort({ timestamp: 1 });
    if (chats.length === 0) {
      res.status(200).json({ message: 'No chat history available.' });
    } else {
      res.status(200).json({ chats });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error fetching chat history' });
  }
};

export const debugCache = (req, res) => {
  res.json({
    cache: sessionCache.toArray(),
    size: sessionCache.cache.size,
    maxSize: sessionCache.maxSize
  });
};

export const clearCache = (req, res) => {
  sessionCache.clear();
  res.json({ message: 'Cache cleared.' });
};

export const deleteSession = async (req, res) => {
  const sessionId = req.params.session_id;
  try {
    await Chat.deleteMany({ session_id: sessionId });
    sessionCache.delete(sessionId);
    res.status(200).json({ message: 'Session deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting session.' });
  }
}; 