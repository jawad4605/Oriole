import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import PlayerControls from './PlayerControls';

const DocumentViewer = ({ documentData }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [highlightedWord, setHighlightedWord] = useState(null);
  const stageRef = useRef(null);
  
  const pageData = documentData.pages[currentPage] || {};
  const { words = [], dimensions = [800, 600], image } = pageData;

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
    setHighlightedWord(null);
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(documentData.pages.length - 1, prev + 1));
    setHighlightedWord(null);
  };

  const highlightWord = (word, index) => {
    setHighlightedWord({ ...word, index });
  };

  return (
    <div className="document-viewer">
      <div className="controls">
        <button 
          className="btn"
          onClick={handlePrevious}
          disabled={currentPage === 0}
        >
          ← Previous
        </button>
        
        <span>Page {currentPage + 1} of {documentData.pages.length}</span>
        
        <button 
          className="btn"
          onClick={handleNext}
          disabled={currentPage === documentData.pages.length - 1}
        >
          Next →
        </button>
      </div>

      <div className="viewport-container">
        {image ? (
          <div style={{ position: 'relative' }}>
            <img 
              src={image} 
              alt={`Page ${currentPage + 1}`} 
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                display: 'block' 
              }}
            />
            
            <Stage 
              width={dimensions[0]} 
              height={dimensions[1]} 
              ref={stageRef}
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              <Layer>
                {highlightedWord && highlightedWord.bbox && (
                  <Rect
                    x={highlightedWord.bbox[0]}
                    y={highlightedWord.bbox[1]}
                    width={highlightedWord.bbox[2] - highlightedWord.bbox[0]}
                    height={highlightedWord.bbox[3] - highlightedWord.bbox[1]}
                    fill="rgba(255, 255, 0, 0.3)"
                    stroke="gold"
                    strokeWidth={1}
                  />
                )}
              </Layer>
            </Stage>
          </div>
        ) : (
          <div className="text-content">
            <pre style={{ 
              padding: '20px', 
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              minHeight: '500px'
            }}>
              {pageData.text}
            </pre>
          </div>
        )}
      </div>

      <PlayerControls 
        words={words} 
        onHighlight={highlightWord}
        highlightedIndex={highlightedWord?.index}
      />
    </div>
  );
};

export default DocumentViewer;