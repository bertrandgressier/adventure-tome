'use client';

import { useState, useEffect, useRef } from 'react';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Créer l'élément audio
    audioRef.current = new Audio('/music1.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3; // Volume à 30% par défaut

    // Charger les préférences depuis localStorage
    const savedMuted = localStorage.getItem('musicMuted');
    if (savedMuted === 'true') {
      setIsMuted(true);
    } else {
      // Démarrer la musique automatiquement si non muté
      playMusic();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playMusic = async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('Audio autoplay blocked:', error);
      }
    }
  };

  const toggleMusic = () => {
    if (isMuted || !isPlaying) {
      // Activer la musique - créer une nouvelle instance si nécessaire
      if (!audioRef.current) {
        audioRef.current = new Audio('/music1.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
      }
      audioRef.current.play();
      setIsPlaying(true);
      setIsMuted(false);
      localStorage.setItem('musicMuted', 'false');
    } else {
      // Désactiver la musique complètement - détruire l'instance audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = ''; // Libère la ressource
        audioRef.current = null; // Détruit l'instance
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
