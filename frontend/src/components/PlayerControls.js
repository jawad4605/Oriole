import React, { useState, useEffect } from 'react';

const PlayerControls = ({ words, onHighlight, highlightedIndex }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [utterance, setUtterance] = useState(null);

  useEffect(() => {
    if (!window.speechSynthesis) {
      console.warn("Web Speech API not supported");
      return;
    }

    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance();
    u.lang = 'en-US';
    u.rate = 1;
    
    setUtterance(u);
    
    return () => {
      synth.cancel();
    };
  }, []);

  useEffect(() => {
    if (utterance && words.length > 0) {
      utterance.text = words.map(w => w.text).join(' ');
    }
  }, [words, utterance]);

  useEffect(() => {
    if (!utterance) return;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        let cumulativeLength = 0;
        
        for (let i = 0; i < words.length; i++) {
          cumulativeLength += words[i].text.length;
          if (cumulativeLength > charIndex) {
            setCurrentIndex(i);
            onHighlight(words[i], i);
            break;
          }
        }
      }
    };
  }, [utterance, words, onHighlight]);

  const togglePlayback = () => {
    const synth = window.speechSynthesis;
    
    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
    } else {
      if (synth.paused) {
        synth.resume();
      } else {
        synth.speak(utterance);
      }
      setIsPlaying(true);
    }
  };

  const handleWordClick = (word, index) => {
    setCurrentIndex(index);
    onHighlight(word, index);
    
    if (utterance) {
      const synth = window.speechSynthesis;
      synth.cancel();
      
      // Speak from the clicked word
      const textFromWord = words.slice(index).map(w => w.text).join(' ');
      const u = new SpeechSynthesisUtterance(textFromWord);
      u.lang = 'en-US';
      u.rate = 1;
      synth.speak(u);
      setIsPlaying(true);
    }
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