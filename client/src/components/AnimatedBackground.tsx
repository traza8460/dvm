import React, { useRef, useEffect } from 'react';

export const AnimatedBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.defaultMuted = true;
      video.muted = true;
      video.play().catch(err => {
        console.warn('Autoplay prevented, retrying on user interaction:', err);
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Fallback dark tone */}
      <div className="absolute inset-0 bg-[#09090b]" />

      {/* High-Performance Looping MP4 Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover scale-105"
      >
        <source src="/bg-video.mp4" type="video/mp4" />
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_084718_72a17915-4964-4059-afcd-22d59399b72e.mp4"
          type="video/mp4"
        />
      </video>

      {/* Cybernetic Darkening Vignette for Text Readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/75 via-transparent to-[#09090b]/85" />
    </div>
  );
};
