import React, { useState, useEffect } from 'react';

const Stream = () => {
  const [streamLink, setStreamLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load the stream link from localStorage (set by admin)
    const storedLink = localStorage.getItem('streamLink');
    if (storedLink) {
      setStreamLink(storedLink);
    }
    setIsLoading(false);
  }, []);

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

  const embedUrl = getTwitchEmbedUrl(streamLink);

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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          📺 Live Stream
        </h1>
        <p className="text-gray-300">
          Watch the live Rocket League action
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800/90 rounded-2xl border border-gray-600 overflow-hidden">
          {embedUrl ? (
            <div className="relative" style={{ paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
              <iframe
                src={embedUrl}
                className="absolute top-0 left-0 w-full h-full"
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

        {streamLink && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Stream source: <a
                href={streamLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                {streamLink}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stream;