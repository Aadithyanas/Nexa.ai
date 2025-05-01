import React, { useEffect, useState, useRef } from 'react';
import { FaTrash } from 'react-icons/fa';
import { Trash } from 'lucide-react';

const Sidebar = ({ userId, onSessionSelect, onCollapse, isCollapsed, setIsCollapsed }) => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isEdgeHovered, setIsEdgeHovered] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const collapseTimerRef = useRef(null);
  const edgeDebounceRef = useRef(null);
  const sidebarRef = useRef(null);

  // Auto-hide timer
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    
    if (!isHovered && !isEdgeHovered && (!isCollapsed || (isMobile && !isHidden))) {
      collapseTimerRef.current = setTimeout(() => {
        setIsCollapsed(true);
        setTimeout(() => setIsHidden(true), 300); // Wait for collapse animation
      }, 3000);
    }
    return () => {
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current);
      }
    };
  }, [isHovered, isEdgeHovered, isCollapsed, setIsCollapsed]);

  // Mouse position detection for edge hover with debounce
  useEffect(() => {
    const handleMouseMove = (e) => {
      const isNearEdge = e.clientX <= 50;
      const isMobile = window.innerWidth <= 768;

      // Clear any existing debounce timer
      if (edgeDebounceRef.current) {
        clearTimeout(edgeDebounceRef.current);
      }

      // Immediately show sidebar if near edge
      if (isNearEdge && (isCollapsed || isHidden)) {
        setIsHidden(false);
        setIsEdgeHovered(true);
        setIsCollapsed(false);
      }

      // Use debounce for hiding only
      edgeDebounceRef.current = setTimeout(() => {
        if (!isNearEdge && !isHovered) {
          setIsEdgeHovered(false);
          if (!isMobile) {
            collapseTimerRef.current = setTimeout(() => {
              setIsCollapsed(true);
              setTimeout(() => setIsHidden(true), 300);
            }, 3000);
          }
        }
      }, 50);
    };

    // Add touch event handling for mobile devices
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      const isNearEdge = touch.clientX <= 50;
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile && isNearEdge) {
        e.preventDefault(); // Prevent default touch behavior
        setIsHidden(false);
        setIsEdgeHovered(true);
        setIsCollapsed(false);
      }
    };

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      const isNearEdge = touch.clientX <= 50;
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile && isNearEdge) {
        e.preventDefault(); // Prevent default touch behavior
        setIsHidden(false);
        setIsEdgeHovered(true);
        setIsCollapsed(false);
      }
    };

    // Add resize handler to update mobile state
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile && !isCollapsed) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      if (edgeDebounceRef.current) {
        clearTimeout(edgeDebounceRef.current);
      }
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current);
      }
    };
  }, [isCollapsed, isHovered, isHidden, setIsCollapsed]);

  // Handle mouse enter/leave for sidebar
  const handleMouseEnter = () => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
      setIsHovered(true);
      setIsEdgeHovered(false);
      setIsHidden(false);
      setIsCollapsed(false);
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current);
      }
    }
  };

  const handleMouseLeave = (e) => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
      if (edgeDebounceRef.current) {
        clearTimeout(edgeDebounceRef.current);
      }

      setIsHovered(false);
      const isNearEdge = e.clientX <= 50;
      
      if (!isNearEdge) {
        setIsEdgeHovered(false);
        collapseTimerRef.current = setTimeout(() => {
          setIsCollapsed(true);
          setTimeout(() => setIsHidden(true), 300);
        }, 3000);
      }
    }
  };

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://antler-4k4i.onrender.com/sessions/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }
        const data = await response.json();
        setSessions(data.sessions);
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
    // Auto-collapse on mobile after selection
    if (window.innerWidth <= 768) {
      setIsCollapsed(true);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleNewChat = async () => {
    try {
      const response = await fetch('https://antler-4k4i.onrender.com/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to create new session');
      const data = await response.json();
      setSessions([data.session, ...sessions]);
      handleSessionClick(data.session._id);
    } catch (err) {
      alert('Error creating new session. Please make sure the backend server is running.');
      console.error('Error creating new session:', err);
    }
  };

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      @keyframes sessionPulse {
        0% { background-color: rgba(59, 130, 246, 0.1); }
        50% { background-color: rgba(59, 130, 246, 0.15); }
        100% { background-color: rgba(59, 130, 246, 0.1); }
      }
      .sidebar-container {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        border-right: 1px solid rgba(37, 99, 235, 0.3);
        backdrop-filter: blur(12px);
        background: rgba(0, 0, 0, 0.2) !important;
        transform: translateX(0);
        opacity: 1;
        pointer-events: auto;
      }
      .sidebar-container.hidden {
        transform: translateX(-100%);
        opacity: 0;
        pointer-events: none;
      }
      .sidebar-container.collapsed {
        width: 5rem !important;
      }
      @media (max-width: 768px) {
        .sidebar-container {
          transform: translateX(0);
          width: 5rem !important;
          background: rgba(0, 0, 0, 0.2) !important;
          backdrop-filter: blur(12px);
        }
        .sidebar-container.expanded {
          width: 16rem !important;
        }
        .sidebar-container.hidden {
          transform: translateX(-100%);
          opacity: 0;
          pointer-events: none;
        }
      }
      .session-item {
        transition: all 0.2s ease;
        border: 1px solid transparent;
        background: rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(8px);
      }
      .session-item:hover {
        transform: translateX(5px);
        border-color: rgba(59, 130, 246, 0.3);
        background: rgba(59, 130, 246, 0.1);
      }
      .session-item.selected {
        animation: sessionPulse 2s infinite;
        border-color: rgba(59, 130, 246, 0.5);
        background: rgba(59, 130, 246, 0.15);
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
      .scrollable-container {
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none;  /* IE and Edge */
        overflow-y: auto;
      }
      .scrollable-container::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
      }
      @keyframes fadeIn {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .sidebar-overlay {
        display: none;
      }
      @media (max-width: 768px) {
        .sidebar-overlay {
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(65, 63, 63, 0.5);
          z-index: 40;
          opacity: ${isCollapsed ? '0' : '1'};
          pointer-events: ${isCollapsed ? 'none' : 'auto'};
          transition: opacity 0.3s ease;
        }
      }
      .session-item .delete-session-btn {
        opacity: 0;
        transform: translateX(10px);
        transition: all 0.2s ease-in-out;
        background: transparent;
        border-radius: 0.5rem;
        padding: 0.5rem;
      }
      .session-item:hover .delete-session-btn {
        opacity: 1;
        transform: translateX(0);
      }
      .delete-session-btn:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
      }
      .sidebar-container.expanded .session-item .delete-session-btn {
        opacity: 1;
        pointer-events: auto;
      }
      .session-item:focus-within .delete-session-btn {
        opacity: 1;
        pointer-events: auto;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [isCollapsed]);

  return (
    <>
      {/* Mobile overlay */}
      <div className="sidebar-overlay" onClick={() => setIsCollapsed(true)} />
      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`sidebar-container fixed top-0 left-0 h-screen text-white 
          ${!isCollapsed ? 'expanded' : 'collapsed'} 
          ${isHidden ? 'hidden' : ''}`}
        style={{
          width: isCollapsed ? '5rem' : '16rem',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(12px)',
          background: 'transparent',
        }}
      >
        {/* Header with toggle button */}
        <div className="flex items-center justify-between p-4 border-b border-blue-600/30">
          {!isCollapsed && (
            <h2 className="text-xl font-semibold bg-clip-text text-transparent" style={{color: '#e0e0e0'}}>
              Sessions
            </h2>
          )}
          <button 
            onClick={toggleSidebar}
            className="toggle-button p-2 rounded-lg hover:bg-blue-500/10 transition-all duration-200"
            style={{
              marginLeft: isCollapsed ? 'auto' : 0,
              marginRight: isCollapsed ? 'auto' : 0,
              backdropFilter: 'blur(12px)',
               background: 'transparent',
              
              color: '#e0e0e0',
              backdropFilter: 'blur(8px)',
              transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)'
            }}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{
                transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)'
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {/* Create New Chat Button */}
        <div className="p-2 " >
          <button 
            onClick={handleNewChat}
            className="text-white font-medium rounded-md w-full flex items-center justify-center hover:bg-blue-500/10 transition-all duration-200"
            style={{
             
              background: 'transparent',
              backdropFilter: 'blur(8px)',
             
              color: '#e0e0e0',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              padding: isCollapsed ? '0.5rem' : '0.5rem 1rem',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color: '#2563eb'}}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {!isCollapsed && <span className="ml-2">New Chat</span>}
          </button>
        </div>
        {/* Scrollable Session List */}
        <div className="scrollable-container flex-1 py-2 mt-2" 
             style={{
               scrollBehavior: 'smooth',
               maxHeight: 'calc(100vh - 180px)',
               overflowY: 'auto',
               msOverflowStyle: 'none',
               scrollbarWidth: 'none',
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
                className={`session-item ${selectedId === session._id ? 'selected' : ''} group`}
                style={{
                  margin: '0.5rem',
                  padding: isCollapsed ? '0.75rem 0.5rem' : '0.75rem 1rem',
                  cursor: 'pointer',
                  background: 'rgba(93, 93, 141, 0.2)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '1rem',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                  animation: `fadeIn 0.3s ease-out forwards ${index * 0.1}s`,
                  opacity: 0,
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 0,
                  justifyContent: isCollapsed ? 'center' : 'space-between',
                  transition: 'all 0.2s ease-in-out',
                }}
                onClick={e => {
                  if (e.target.closest('.delete-session-btn')) return;
                  handleSessionClick(session._id);
                }}
              >
                <div className="flex items-center min-w-0 flex-1">
                  <div
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '50%',
                      background: '#181818',
                     
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      color: '#e0e0e0',
                      marginRight: isCollapsed ? 0 : '0.75rem',
                      flexShrink: 0,
                    }}
                  >
                    {(session.firstMessage || 'Chat').charAt(0).toUpperCase()}
                  </div>
                  {!isCollapsed && (
                    <div className="truncate flex-1">
                      <div className="font-medium truncate">
                        {session.firstMessage || 'Untitled Chat'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(session.createdAt)}
                      </div>
                    </div>
                  )}
                </div>
                {/* Only show delete button if sidebar is not collapsed */}
                {!isCollapsed && (
                  <button
                    className="delete-session-btn ml-2 transition-colors"
                    title="Delete this session"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!window.confirm('Delete this session and all its messages?')) return;
                      try {
                        const resp = await fetch(`https://antler-4k4i.onrender.com/session/${session._id}`, {
                          method: 'DELETE',
                        });
                        if (!resp.ok) throw new Error('Failed to delete session');
                        setSessions(sessions.filter(s => s._id !== session._id));
                        if (selectedId === session._id) {
                          setSelectedId(null);
                          onSessionSelect(null);
                        }
                      } catch (err) {
                        alert('Error deleting session.');
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '2rem',
                      minHeight: '2rem',
                      marginLeft: '0.5rem',
                    }}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        {/* User Info */}
        <div className="border-t border-blue-600/30 p-4" style={{
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(8px)'
        }}>
          <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center'}`}>
            <div style={{
              width: isCollapsed ? '2rem' : '2.5rem',
              height: isCollapsed ? '2rem' : '2.5rem',
              borderRadius: '50%',
              background: '#181818',
              
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: isCollapsed ? '0' : '0.75rem',
              boxShadow: '0 0 10px #2563eb44',
              color: '#e0e0e0',
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
    </>
  );
};

export default Sidebar;