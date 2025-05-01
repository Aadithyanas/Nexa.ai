import React, { useState, useEffect, memo } from "react";

// YouTubeSearch Component - Memoized to prevent unnecessary re-renders
const YoutubeAutomation = memo(({ query }) => {
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchVideo = async () => {
      if (!query) return;

      setLoading(true);

      try {
        const searchQuery = encodeURIComponent(query);
        const apiKey = "AIzaSyAHJp-QqTwCbwMse0ZpBNFtEEYj672e6Q8";
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&key=${apiKey}&type=video&maxResults=1`
        );
        const data = await response.json();
        const videoId = data.items[0]?.id?.videoId;

        if (videoId) {
          setVideoId(videoId);
        }
      } catch (err) {
        console.error('Error searching YouTube:', err);
      } finally {
        setLoading(false);
      }
    };

    searchVideo();
  }, [query]);

  if (loading) {
    return (
      <div className="youtube-loading">
        <div className="spinner" />
        <div>Loading video...</div>
      </div>
    );
  }

  return videoId ? (
    <div className="youtube-player" style={{ width: '100%', maxWidth: '960px', margin: '0 auto' }}>
      <iframe
        width="160"
        height="105"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ borderRadius: '12px', marginTop: '10px', width: '550px', minHeight: '350px', background: '#000' }}
      />
    </div>
  ) : (
    <div className="youtube-error">
      Could not load video. Try opening on YouTube:
      <a
        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="youtube-fallback-link"
      >
        Search on YouTube
      </a>
    </div>
  );
});

export default YoutubeAutomation;