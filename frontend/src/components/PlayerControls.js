import React, { useState, useEffect, useRef, useCallback } from 'react';

const PlayerControls = ({ words, onHighlight, highlightedIndex }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const utteranceRef = useRef(null);
  const synthRef = useRef(null);

  // Create boundary handler with proper word offset calculation
  const createBoundaryHandler = useCallback((wordOffset = 0) => {
    return (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        let cumulativeLength = 0;
        
        for (let i = 0; i < words.length; i++) {
          // Add space before each word except the first
          const wordWithSpace = (i === 0 ? '' : ' ') + words[i].text;
          cumulativeLength += wordWithSpace.length;
          
          if (cumulativeLength > charIndex) {
            const actualIndex = wordOffset + i;
            setCurrentIndex(actualIndex);
            onHighlight(words[i], actualIndex);
            break;
          }
        }
      }
    };
  }, [words, onHighlight]);

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
    utteranceRef.current = u;

    return () => {
      synthRef.current.cancel();
    };
  }, []);

  // Update utterance text and boundary handler when words change
  useEffect(() => {
    const u = utteranceRef.current;
    if (!u || words.length === 0) return;

    // Reset playback state on word change
    synthRef.current.cancel();
    setIsPlaying(false);
    setCurrentIndex(0);
    
    u.text = words.map(w => w.text).join(' ');
    u.onboundary = createBoundaryHandler(0);
  }, [words, createBoundaryHandler]);

  const togglePlayback = () => {
    const synth = synthRef.current;
    const u = utteranceRef.current;
    if (!synth || !u) return;

    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
    } else {
      if (synth.paused) {
        synth.resume();
      } else {
        synth.speak(u);
      }
      setIsPlaying(true);
    }
  };

  const handleWordClick = (word, index) => {
    setCurrentIndex(index);
    onHighlight(word, index);
    
    const synth = synthRef.current;
    if (!synth) return;

    synth.cancel();
    
    // Create partial utterance from clicked word
    const partialWords = words.slice(index);
    const partialText = partialWords.map(w => w.text).join(' ');
    const partialUtterance = new SpeechSynthesisUtterance(partialText);
    partialUtterance.lang = 'en-US';
    partialUtterance.rate = 1;
    partialUtterance.onboundary = createBoundaryHandler(index);
    
    synth.speak(partialUtterance);
    utteranceRef.current = partialUtterance;
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