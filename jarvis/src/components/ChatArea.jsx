import React, { useContext, useRef, useEffect, useState, memo } from "react";
import { datacontext } from "../context/VoiceContext";
import YoutubeAutomation from './YoutubeAutomation';

const Message = memo(({ msg, sessionId, index }) => {
  return (
    <div
      key={`${sessionId}-${index}`}
      style={{
        display: "flex",
        justifyContent:
          msg.type === "user"
            ? "flex-end"
            : msg.type === "system"
            ? "center"
            : "flex-start",
        marginBottom: "0.5rem",
      }}
    >
      <div
        className={
          msg.type === "user"
            ? "message-bubble-user"
            : msg.type === "system"
            ? "message-bubble-system"
            : msg.type === "youtube"
            ? "message-bubble-youtube"
            : "message-bubble-ai"
        }
        style={{
          transition: "all 0.3s ease",
          animationDelay: `${index * 0.1}s`,
          maxWidth: "90%",
        }}
      >
        {msg.type !== "youtube" && (
          <p
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              marginBottom: "0.25rem",
              opacity: 0.9,
            }}
          >
            {msg.type === "user"
              ? "You"
              : msg.type === "system"
              ? "System"
              : "Nexa"}
          </p>
        )}

        {msg.type === "youtube" ? (
          <YoutubeAutomation query={msg.query} />
        ) : (
          <p
            style={{
              fontSize: "0.875rem",
              lineHeight: "1.4",
            }}
          >
            {msg.text}
          </p>
        )}
      </div>
    </div>
  );
});

function ChatArea({ sessionId }) {
  const { conversations, setConversations } = useContext(datacontext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const conversationEndRef = useRef(null);
  
  useEffect(() => {
    const fetchSessionMessages = async () => {
      if (!sessionId) {
        setConversations([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:3000/session/${sessionId}`);
        if (!response.ok) throw new Error('Failed to fetch session messages');
        
        const data = await response.json();
        
        if (data.chats && Array.isArray(data.chats)) {
          // Transform the flat chats array into conversation pairs
          const formattedMessages = [];
          
          data.chats.forEach(chat => {
            if (chat.message) {
              formattedMessages.push({ type: 'user', text: chat.message });
            }
            if (chat.response) {
              formattedMessages.push({ type: 'ai', text: chat.response });
            }
            if (chat.query) {
              formattedMessages.push({ type: 'youtube', query: chat.query });
            }
          });
          
          setConversations(formattedMessages);
        } else {
          setConversations([]);
        }
      } catch (err) {
        console.error('Error fetching session messages:', err);
        setError('Failed to load conversation history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionMessages();
  }, [sessionId, setConversations]);

  // Auto-scroll to bottom when conversations update
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversations]);

  if (isLoading) {
    return (
      <div style={{ 
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'yellow'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        marginBottom: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "0.5rem",
        scrollBehavior: "smooth",
        msOverflowStyle: "none",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(14, 165, 233, 0.3) transparent",
        position: "relative",
      }}
    >
      {conversations.map((msg, index) => (
        <Message 
          key={`${sessionId}-${index}`}
          msg={msg} 
          sessionId={sessionId} 
          index={index}
        />
      ))}
      <div ref={conversationEndRef} />
    </div>
  );
}

export default memo(ChatArea);