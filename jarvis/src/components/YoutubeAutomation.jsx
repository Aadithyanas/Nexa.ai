import React, { useState, useEffect, memo } from "react";

// YouTubeSearch Component - Memoized to prevent unnecessary re-renders
const YoutubeAutomation = memo(({ query }) => {
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoDetails, setVideoDetails] = useState(null);

  const apiKey = "AIzaSyAHJp-QqTwCbwMse0ZpBNFtEEYj672e6Q8"; // Replace with your YouTube API Key

  // Load YouTube API script
  const loadYouTubeAPI = () => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      window.gapi.load("client", () => {
        window.gapi.client.setApiKey(apiKey);
        window.gapi.client.load("youtube", "v3", () => {
          console.log("YouTube API Loaded");
          if (query) {
            searchAndPlay(query);
          }
        });
      });
    };
    document.body.appendChild(script);
  };

  // Fetch video details using video ID
  const fetchVideoDetails = (id) => {
    window.gapi.client.youtube.videos
      .list({
        part: "snippet,statistics",
        id: id
      })
      .then((response) => {
        if (response.result.items.length > 0) {
          setVideoDetails(response.result.items[0]);
        }
      })
      .catch((error) => {
        console.error("Error fetching video details", error);
      });
  };

  // Search and play video based on query
  const searchAndPlay = (searchQuery) => {
    if (!searchQuery) {
      console.error("No search query provided");
      return;
    }

    setLoading(true);

    window.gapi.client.youtube.search
      .list({
        q: searchQuery,
        part: "snippet",
        maxResults: 1,
        type: "video"
      })
      .then((response) => {
        if (response.result.items.length > 0) {
          const id = response.result.items[0].id.videoId;
          setVideoId(id);
          fetchVideoDetails(id);
        } else {
          console.log("No videos found for the query");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching YouTube data", error);
        setLoading(false);
      });
  };

  // Initialize API and trigger search when component mounts or query changes
  useEffect(() => {
    let apiLoaded = false;
    
    // Check if API already loaded
    if (window.gapi && window.gapi.client) {
      apiLoaded = true;
      if (query) {
        searchAndPlay(query);
      }
    } else {
      loadYouTubeAPI();
    }
    
    // If query changes and API is loaded, search again
    if (apiLoaded && query) {
      searchAndPlay(query);
    }
  }, [query]);

  // Format view count with commas
  const formatViews = (viewCount) => {
    return viewCount ? parseInt(viewCount).toLocaleString() : "0";
  };

  // Format date to readable format
  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    return new Date(isoDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Truncate description if it's too long
  const truncateDescription = (description, maxLength = 300) => {
    if (!description) return "";
    if (description.length <= maxLength) return description;
    return description.substr(0, maxLength) + "...";
  };

  return (
    <div>
      <h1>YouTube Video Player</h1>
      {loading ? (
        <p>Loading your video...</p>
      ) : (
        videoId && (
          <div>
            <div>
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              ></iframe>
            </div>
            
            {videoDetails && (
              <div style={{ marginTop: "20px", maxWidth: "560px" }}>
                <h2>{videoDetails.snippet.title}</h2>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                  <p><strong>Channel:</strong> {videoDetails.snippet.channelTitle}</p>
                  <p><strong>Published:</strong> {formatDate(videoDetails.snippet.publishedAt)}</p>
                </div>
                
                <div style={{ marginBottom: "15px" }}>
                  <p><strong>Views:</strong> {formatViews(videoDetails.statistics.viewCount)}</p>
                  <p><strong>Likes:</strong> {formatViews(videoDetails.statistics.likeCount)}</p>
                </div>
                
                <div>
                  <h3>Description:</h3>
                  <p style={{ whiteSpace: "pre-wrap" }}>{truncateDescription(videoDetails.snippet.description)}</p>
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
});

export default YoutubeAutomation;