import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/apiService';

const Stream = () => {
  const [streamLink, setStreamLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const streamContainerRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatPollingRef = useRef(null);

  useEffect(() => {
    const initializeStream = async () => {
      try {
        // Load stream settings from database
        const streamUrl = await apiService.getStreamSetting('stream_link');
        if (streamUrl) {
          setStreamLink(streamUrl);
        }

        // Load initial chat messages
        await loadChatMessages();
      } catch (error) {
        console.error('Error loading stream data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeStream();

    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Handle fullscreen change events
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Start polling for new chat messages every 3 seconds
    chatPollingRef.current = setInterval(loadChatMessages, 3000);

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (chatPollingRef.current) {
        clearInterval(chatPollingRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const getTwitchEmbedUrl = (twitchUrl) => {
    if (!twitchUrl) return '';

    // Extract channel name from Twitch URL
    const match = twitchUrl.match(/twitch\.tv\/([^/?]+)/);
    if (match && match[1]) {
      const channelName = match[1];
      return `https://player.twitch.tv/?channel=${channelName}&parent=${window.location.hostname}&autoplay=false`;
    }
    return '';
  };

  const getTwitchChatUrl = (twitchUrl) => {
    if (!twitchUrl) return '';

    const match = twitchUrl.match(/twitch\.tv\/([^/?]+)/);
    if (match && match[1]) {
      const channelName = match[1];
      return `https://www.twitch.tv/embed/${channelName}/chat?parent=${window.location.hostname}`;
    }
    return '';
  };

  const toggleFullscreen = async () => {
    if (!streamContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await streamContainerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const generateAnonymousUser = () => {
    const colors = ['purple', 'blue', 'green', 'red', 'yellow', 'pink', 'indigo', 'teal'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return {
      color: randomColor,
      colorClass: `bg-${randomColor}-500`
    };
  };

  const loadChatMessages = async () => {
    if (chatLoading) return; // Prevent multiple concurrent requests

    try {
      setChatLoading(true);
      const chatData = await apiService.getChatMessages(50, 0);

      // Transform database messages to match frontend format
      const formattedMessages = chatData.messages.map(msg => ({
        id: msg.id,
        text: msg.message_text,
        timestamp: new Date(msg.created_at),
        user: {
          color: msg.user_color,
          colorClass: `bg-${msg.user_color}-500`
        }
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading chat messages:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    const messageText = newMessage.trim();
    const user = generateAnonymousUser();

    try {
      setSendingMessage(true);

      // Send message to database
      const response = await apiService.sendChatMessage(messageText, user.color);

      if (response.success) {
        // Clear input
        setNewMessage('');

        // Immediately reload messages to show the new one
        await loadChatMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Show error to user
      if (error.message.includes('Too many messages')) {
        alert('You are sending messages too quickly. Please wait a moment before sending another message.');
      } else if (error.message.includes('exceed 500 characters')) {
        alert('Message is too long. Please keep it under 500 characters.');
      } else {
        alert('Failed to send message. Please try again.');
      }
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const embedUrl = getTwitchEmbedUrl(streamLink);
  const chatUrl = getTwitchChatUrl(streamLink);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-300">Loading stream...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!streamLink) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-gray-800/90 rounded-2xl border border-gray-600 p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">📺</div>
            <h2 className="text-2xl font-bold text-white mb-4">No Stream Available</h2>
            <p className="text-gray-300 mb-4">
              There is currently no stream configured.
            </p>
            <p className="text-sm text-gray-400">
              Stream links are managed through the admin panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'container mx-auto px-4 pt-24 pb-8'}`}>
      {!isFullscreen && (
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            📺 Live Stream
          </h1>
          <p className="text-gray-300">
            Watch the live Rocket League action
          </p>
        </div>
      )}

      <div className={`${isFullscreen ? 'h-full' : 'max-w-7xl mx-auto'}`}>
        <div
          ref={streamContainerRef}
          className={`${
            isFullscreen
              ? 'h-full flex'
              : isMobile
                ? 'space-y-4'
                : 'grid grid-cols-3 gap-4'
          }`}
        >
          {/* Stream Player */}
          <div className={`${
            isFullscreen
              ? showChat ? 'flex-1' : 'w-full'
              : isMobile
                ? 'w-full'
                : 'col-span-2'
          }`}>
            <div className="bg-gray-800/90 rounded-2xl border border-gray-600 overflow-hidden relative">
              {/* Controls */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                {!isMobile && (
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors backdrop-blur-sm"
                    title={showChat ? 'Hide Chat' : 'Show Chat'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={toggleFullscreen}
                  className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors backdrop-blur-sm"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isFullscreen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                    )}
                  </svg>
                </button>
              </div>

              {embedUrl ? (
                <div className={`relative ${isFullscreen ? 'h-full' : ''}`} style={!isFullscreen ? { paddingTop: '56.25%' } : {}}>
                  <iframe
                    src={embedUrl}
                    className={`${isFullscreen ? 'w-full h-full' : 'absolute top-0 left-0 w-full h-full'}`}
                    frameBorder="0"
                    scrolling="no"
                    allowFullScreen
                    title="Twitch Stream"
                  />
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-900">
                  <div className="text-center p-8">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Invalid Stream Link</h3>
                    <p className="text-gray-300">
                      The configured stream link appears to be invalid.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Section */}
          {(showChat || (isMobile && !isFullscreen)) && (
            <div className={`${
              isFullscreen
                ? 'w-80 flex-shrink-0'
                : isMobile
                  ? 'w-full'
                  : 'col-span-1'
            }`}>
              <div className={`bg-gray-800/90 rounded-2xl border border-gray-600 ${
                isFullscreen ? 'h-full' : isMobile ? 'h-96' : 'h-[600px]'
              } flex flex-col`}>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-600 flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    💬 Stream Chat
                  </h3>
                  {isMobile && (
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Anonymous Chat Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-3 text-sm">
                    {messages.length === 0 ? (
                      <div className="text-gray-400 text-center py-8">
                        <div className="text-4xl mb-2">💬</div>
                        <p>Welcome to the stream chat!</p>
                        <p className="text-xs mt-1">All messages are anonymous. Be the first to say hello!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div key={message.id} className="flex items-start gap-2">
                          <div className={`w-6 h-6 ${message.user.colorClass} rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                            A
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-gray-300 flex items-center gap-2">
                              <span className={`text-${message.user.color}-400 font-medium`}>Anonymous</span>
                              <span className="text-gray-500 text-xs">{formatTime(message.timestamp)}</span>
                            </div>
                            <div className="text-white break-words">{message.text}</div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-600">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none text-sm"
                      maxLength={500}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sendingMessage}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                      {sendingMessage ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </form>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Messages are anonymous • Max 500 characters • Real-time chat
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stream Info (only when not fullscreen) - Positioned to not interfere with player */}
        {!isFullscreen && streamLink && (
          <div className="mt-8 text-center">
            <details className="text-sm text-gray-400 max-w-md mx-auto">
              <summary className="cursor-pointer hover:text-gray-300 transition-colors">
                Stream Info
              </summary>
              <p className="mt-2 p-2 bg-gray-800/50 rounded border border-gray-600">
                Source: <a
                  href={streamLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline break-all"
                >
                  {streamLink}
                </a>
              </p>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stream;