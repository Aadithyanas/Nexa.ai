import React, { useEffect, useState } from 'react';

const Sidebar = ({ userId, onSessionSelect }) => {
  const [sessions, setSessions] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/sessions/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }
        const data = await response.json();
        setSessions(data.sessions);
        setAnimationClass('sidebar-enter');
        setTimeout(() => setAnimationClass(''), 500);
      } catch (err) {
        console.error('Error fetching sessions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [userId]);

  const handleSessionClick = (sessionId) => {
    setSelectedId(sessionId);
    onSessionSelect(sessionId);
  };

  const toggleSidebar = () => {
    if (!isCollapsed) {
      setAnimationClass('sidebar-exit');
      setTimeout(() => {
        setIsCollapsed(true);
        setAnimationClass('');
      }, 300);
    } else {
      setIsCollapsed(false);
      setAnimationClass('sidebar-enter');
      setTimeout(() => setAnimationClass(''), 300);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleNewChat = async () => {
    try {
      const response = await fetch('http://localhost:3000/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      setSessions([data.session, ...sessions]);
      handleSessionClick(data.session._id);
    } catch (err) {
      console.error('Error creating new session:', err);
    }
  };

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      @keyframes sidebarEnter {
        0% { transform: translateX(-100%); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes sidebarExit {
        0% { transform: translateX(0); width: 16rem; opacity: 1; }
        100% { transform: translateX(-20px); width: 4rem; opacity: 0.7; }
      }
      
      @keyframes sessionPulse {
        0% { background-color: rgba(59, 130, 246, 0.2); }
        50% { background-color: rgba(59, 130, 246, 0.3); }
        100% { background-color: rgba(59, 130, 246, 0.2); }
      }
      
      .sidebar-container {
        transition: all 0.3s ease-in-out;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(5px);
      }
      
      .sidebar-enter {
        animation: sidebarEnter 0.3s ease-out forwards;
      }
      
      .sidebar-exit {
        animation: sidebarExit 0.3s ease-out forwards;
      }
      
      .session-item {
        transition: all 0.2s ease;
        border: 1px solid transparent;
      }
      
      .session-item:hover {
        transform: translateX(5px);
        border-color: rgba(59, 130, 246, 0.3);
      }
      
      .session-item.selected {
        animation: sessionPulse 2s infinite;
        border-color: rgba(59, 130, 246, 0.5);
      }
      
      .toggle-button {
        transition: transform 0.3s ease;
      }
      
      .toggle-button:hover {
        transform: scale(1.2);
      }

      .loading-spinner {
        border: 3px solid rgba(59, 130, 246, 0.3);
        border-top: 3px solid rgba(59, 130, 246, 0.8);
        border-radius: 50%;
        width: 24px;
        height: 24px;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Updated scrollbar styles to not affect element size */
      .scrollable-container {
        scrollbar-width: thin;
        scrollbar-color: rgba(59, 130, 246, 0.5) transparent;
        scrollbar-gutter: stable;
        overflow-y: overlay; /* Use 'overlay' instead of 'auto' to prevent layout shift */
      }

      .scrollable-container::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      .scrollable-container::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 10px;
      }

      .scrollable-container::-webkit-scrollbar-thumb {
        background-color: rgba(59, 130, 246, 0.5);
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .scrollable-container::-webkit-scrollbar-thumb:hover {
        background-color: rgba(59, 130, 246, 0.7);
      }

      @keyframes fadeIn {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div 
      className={`sidebar-container fixed top-0 left-0 h-screen bg-gray-900 text-white ${animationClass}`}
      style={{
        width: isCollapsed ? '5rem' : '16rem',
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header with toggle button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700" 
           style={{borderColor: 'rgba(255, 255, 255, 0.1)'}}>
        {!isCollapsed && (
          <h2 className="text-xl font-semibold" style={{textShadow: '0 0 10px rgba(59, 130, 246, 0.5)'}}>
            Sessions
          </h2>
        )}
        <button 
          onClick={toggleSidebar}
          className="toggle-button p-1 rounded-full hover:bg-gray-700"
          style={{
            background: 'rgba(59, 130, 246, 0.2)',
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
            marginLeft: isCollapsed ? 'auto' : 0,
            marginRight: isCollapsed ? 'auto' : 0
          }}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Create New Chat Button */}
      <div className="p-2">
        <button 
          onClick={handleNewChat}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md w-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 0 10px rgba(14, 165, 233, 0.3)',
            transition: 'all 0.3s ease',
            padding: isCollapsed ? '0.5rem' : '0.5rem 1rem',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2), 0 0 15px rgba(14, 165, 233, 0.5)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 0 10px rgba(14, 165, 233, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {!isCollapsed && <span className="ml-2">New Chat</span>}
        </button>
      </div>

      {/* Scrollable Session List - Modified for fixed width scrolling */}
      <div className="scrollable-container flex-1 py-2 mt-2" 
           style={{
             scrollBehavior: 'smooth',
             maxHeight: 'calc(100vh - 180px)',
             overflowY: 'overlay', /* overlay instead of auto */
             paddingRight: '2px', /* Small padding to prevent content from touching scrollbar */
             boxSizing: 'content-box', /* Ensures padding doesn't affect overall width */
             msOverflowStyle: 'none', /* Hide scrollbar in IE and Edge */
           }}>
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <div className="loading-spinner"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-gray-400 p-4" style={{animation: 'fadeIn 0.5s ease-out'}}>
            {!isCollapsed && "No sessions found"}
          </div>
        ) : (
          sessions.map((session, index) => (
            <div
              key={session._id}
              className={`session-item ${selectedId === session._id ? 'selected' : ''}`}
              style={{
                margin: '0.5rem',
                padding: isCollapsed ? '0.75rem 0.5rem' : '0.75rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                backgroundColor: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(5px)',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                animation: `fadeIn 0.3s ease-out forwards ${index * 0.1}s`,
                opacity: 0,
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => handleSessionClick(session._id)}
            >
              {isCollapsed ? (
                <div className="flex justify-center">
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    boxShadow: '0 0 10px rgba(14, 165, 233, 0.5)',
                  }}>
                    {(session.firstMessage || 'Chat').charAt(0).toUpperCase()}
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    boxShadow: '0 0 10px rgba(14, 165, 233, 0.5)',
                  }}>
                    {(session.firstMessage || 'Chat').charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate flex-1">
                    <div className="font-medium truncate">
                      {session.firstMessage || 'Untitled Chat'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(session.createdAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* User Info */}
      <div className="border-t border-gray-700 p-4" style={{
        borderColor: 'rgba(255, 255, 255, 0.1)',
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)'
      }}>
        <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center'}`}>
          <div style={{
            width: isCollapsed ? '2rem' : '2.5rem',
            height: isCollapsed ? '2rem' : '2.5rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: isCollapsed ? '0' : '0.75rem',
            boxShadow: '0 0 10px rgba(14, 165, 233, 0.5)',
          }}>
            {userId.charAt(0).toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <div className="font-medium">
                {userId === 'guest' ? 'Guest' : userId}
              </div>
              <div className="text-xs text-gray-400">Online</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;