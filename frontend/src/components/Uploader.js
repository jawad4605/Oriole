import React, { useCallback } from 'react';

const Uploader = ({ onFileUpload }) => {
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className="upload-area"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="upload-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4361ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <h2>Upload Document</h2>
        <p>Drag & drop a file or click to browse</p>
        <p className="formats">Supported formats: PDF, DOCX, JPG, PNG</p>
        
        <label className="file-input-label">
          Select File
          <input
            type="file"
            className="file-input"
            onChange={handleFileChange}
            accept=".pdf,.docx,.jpg,.jpeg,.png"
          />
        </label>
      </div>
    </div>
  );
};

export default Uploader;