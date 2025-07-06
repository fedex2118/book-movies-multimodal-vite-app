import React, { useEffect } from 'react';

export default function VideoControl({ cameraActive, videoRef, canvasRef }) {
  // Clear canvas to transparent when camera is turned off
  useEffect(() => {
    if (!cameraActive && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      // clear canvas to transparent
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [cameraActive, canvasRef]);

  return (
    <div className="absolute top-4 right-4 flex flex-col items-center">
      {/* Hidden video element for MediaPipe processing */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ display: 'none' }}
      />

      {/* Canvas overlay for hand landmarks */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="w-80 h-60 border border-gray-300 rounded-lg bg-transparent"
      />

      {/* Instruction text below canvas */}
      <div className="mt-2 w-80 text-center text-gray-600 text-lg">
        🎥 Press "V" to {cameraActive ? 'disable' : 'enable'} camera
      </div>
    </div>
  );
}