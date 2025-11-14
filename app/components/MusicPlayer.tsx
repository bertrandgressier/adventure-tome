'use client';

import { useState, useEffect, useRef } from 'react';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    // Initialiser depuis localStorage au premier render
    if (typeof window !== 'undefined') {
      const savedMuted = localStorage.getItem('musicMuted');
      return savedMuted !== 'false'; // true par défaut, false si explicitement sauvegardé
    }
    return true;
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasInteracted = useRef(false);

  useEffect(() => {
    // Créer l'élément audio
    audioRef.current = new Audio('/music1.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3; // Volume à 30% par défaut

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    hasInteracted.current = true;

    if (isMuted || !isPlaying) {
      // Activer la musique
      if (!audioRef.current) {
        audioRef.current = new Audio('/music1.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
      }
      
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsMuted(false);
          localStorage.setItem('musicMuted', 'false');
        })
        .catch(error => {
          console.error('Failed to play audio:', error);
          setIsPlaying(false);
          setIsMuted(true);
        });
    } else {
      // Désactiver la musique
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setIsMuted(true);
      localStorage.setItem('musicMuted', 'true');
    }
  };

  return (
    <button
      onClick={toggleMusic}
      className="fixed top-4 right-4 z-50 bg-[#2a1e17] border-2 border-primary/50 hover:border-primary rounded-full p-2 transition-all hover:scale-110 shadow-lg"
      title={isMuted || !isPlaying ? 'Activer la musique' : 'Désactiver la musique'}
    >
      {isMuted || !isPlaying ? (
        <span className="text-lg">🔇</span>
      ) : (
        <span className="text-lg">🔊</span>
      )}
    </button>
  );
}
