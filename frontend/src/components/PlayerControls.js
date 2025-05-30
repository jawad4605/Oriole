import React, { useState, useEffect, useRef } from 'react';

const PlayerControls = ({ words, onHighlight, highlightedIndex }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [utterance, setUtterance] = useState(null);
  const startIndicesRef = useRef([]);
  const synthRef = useRef(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (!window.speechSynthesis) {
      console.warn("Web Speech API not supported");
      return;
    }

    synthRef.current = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance();
    u.lang = 'en-US';
    u.rate = 1;
    
    setUtterance(u);
    
    return () => {
      synthRef.current.cancel();
    };
  }, []);

  // Update utterance text and compute start indices
  useEffect(() => {
    if (utterance && words.length > 0) {
      const fullText = words.map(w => w.text).join(' ');
      utterance.text = fullText;
      
      // Precompute word start indices (including spaces)
      const starts = [];
      let current = 0;
      for (let i = 0; i < words.length; i++) {
        starts.push(current);
        current += words[i].text.length + (i < words.length - 1 ? 1 : 0); // Add space after each word
      }
      startIndicesRef.current = starts;
    }
  }, [words, utterance]);

  // Setup utterance boundary handler
  useEffect(() => {
    if (!utterance) return;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        const startIndices = startIndicesRef.current;
        
        // Find current word index using precomputed start positions
        for (let i = 0; i < startIndices.length; i++) {
          const start = startIndices[i];
          const end = start + words[i].text.length;
          
          if (charIndex >= start && charIndex < end) {
            setCurrentIndex(i);
            onHighlight(words[i], i);
            break;
          }
        }
      }
    };
  }, [utterance, words, onHighlight]);

  const togglePlayback = () => {
    if (!synthRef.current) return;
    
    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
    } else {
      if (synthRef.current.paused) {
        synthRef.current.resume();
      } else {
        synthRef.current.cancel(); // Clear any previous utterances
        synthRef.current.speak(utterance);
      }
      setIsPlaying(true);
    }
  };

  const handleWordClick = (word, index) => {
    setCurrentIndex(index);
    onHighlight(word, index);
    
    if (!synthRef.current || !utterance) return;
    
    synthRef.current.cancel(); // Stop current speech
    
    // Create new utterance from clicked word
    const textToSpeak = words.slice(index).map(w => w.text).join(' ');
    const u = new SpeechSynthesisUtterance(textToSpeak);
    u.lang = 'en-US';
    u.rate = 1;
    
    // Precompute start indices for subset
    const starts = [];
    let current = 0;
    const subset = words.slice(index);
    for (let i = 0; i < subset.length; i++) {
      starts.push(current);
      current += subset[i].text.length + (i < subset.length - 1 ? 1 : 0);
    }
    
    u.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        for (let i = 0; i < starts.length; i++) {
          const start = starts[i];
          const end = start + subset[i].text.length;
          
          if (charIndex >= start && charIndex < end) {
            const originalIndex = index + i;
            setCurrentIndex(originalIndex);
            onHighlight(words[originalIndex], originalIndex);
            break;
          }
        }
      }
    };
    
    synthRef.current.speak(u);
    setIsPlaying(true);
  };

  return (
    <div className="player-controls">
      <div className="playback-controls">
        <button 
          className="play-btn"
          onClick={togglePlayback}
          disabled={words.length === 0}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>

      {words.length > 0 && (
        <div className="progress-container">
          <div className="progress">
            {words.map((word, index) => (
              <span 
                key={index}
                className={`word ${index === currentIndex ? 'active' : ''} ${index === highlightedIndex ? 'highlighted' : ''}`}
                onClick={() => handleWordClick(word, index)}
              >
                {word.text}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerControls;