import React from "react";

export const VideoDisplay = ({ videoRef, canvasRef, loadingStatus, cameraActive }) => (
  <div className="relative w-full h-full bg-gray-900 overflow-hidden">
    {loadingStatus && (
      <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex flex-col justify-center items-center z-10 backdrop-blur-sm">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs text-gray-300">{loadingStatus}</p>
      </div>
    )}

    {!cameraActive && (
      <div className="absolute inset-0 bg-gray-900 flex flex-col justify-center items-center z-10">
        <CameraOffIcon />
        <p className="text-xs text-gray-400">Camera is currently disabled</p>
      </div>
    )}

    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className={`w-full h-full object-cover ${!status.isCameraOn ? "hidden" : ""}`}
    />
  </div>
);

export const StatusOverlay = ({ status, isCameraOn }) => (
  isCameraOn && (
    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-white text-xs">
      <div className="flex justify-between items-center">
        <div>
          <span className="font-semibold">Status:</span>{" "}
          <span className={status.verificationColor}>{status.verificationStatus}</span>
        </div>
        <div className="flex space-x-2">
          <span><span className="font-semibold">FPS:</span> {status.fps}</span>
          <span><span className="font-semibold">Faces:</span> {status.faceCount}</span>
          {status.bodyDetected && (
            <span className="text-green-400">
              <span className="font-semibold">Body:</span> Detected
            </span>
          )}
        </div>
      </div>
    </div>
  )
);

const CameraOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-gray-500 mb-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);