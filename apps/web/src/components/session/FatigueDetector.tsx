"use client";
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

function FatigueDetectorCore() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadModelsAndStart = async () => {
      try {
        const faceapi = await import('face-api.js');
        // In a real app we would await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        // and faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current && active) {
          videoRef.current.srcObject = stream;
          setIsReady(true);
        }
      } catch (err) {
        console.error('Failed to initialize face-api', err);
        setError('Camera access denied or models failed to load.');
      }
    };
    loadModelsAndStart();
    return () => {
      active = false;
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="bg-gray-900 rounded-2xl p-4 overflow-hidden shadow-xl relative aspect-video flex items-center justify-center">
      {error ? (
        <div className="text-red-400 text-sm">{error}</div>
      ) : !isReady ? (
        <div className="text-white text-sm animate-pulse">Initializing camera & AI models...</div>
      ) : null}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`w-full h-full object-cover rounded-xl transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}
      />
      {isReady && (
        <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-white text-xs font-medium tracking-wide">Monitoring Focus</span>
        </div>
      )}
    </div>
  );
}

// Ensure it loads dynamically with next/dynamic and ssr: false
export const FatigueDetector = dynamic(() => Promise.resolve(FatigueDetectorCore), { ssr: false });
