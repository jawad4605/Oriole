import React, { useState } from 'react';
import Uploader from './components/Uploader';
import DocumentViewer from './components/DocumentViewer';
import './styles.css';

function App() {
  const [documentData, setDocumentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/process-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Processing failed');
      }

      const data = await response.json();
      setDocumentData({
        ...data,
        fileType: file.name.split('.').pop().toLowerCase(),
        fileName: file.name,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Interactive Document Reader</h1>
          <p className="app-tagline">Upload, read, and interact with your documents</p>
        </div>
        <div className="header-decoration"></div>
      </header>
      
      <main className="app-main">
        {!documentData ? (
          <div className="upload-container">
            <div className="upload-card">
              <div className="upload-intro">
                <h2>Get Started with Document Reader</h2>
                <p>Upload a document to start reading with interactive features</p>
              </div>
              
              <Uploader onFileUpload={handleFileUpload} />
              
              {isLoading && (
                <div className="processing-indicator">
                  <div className="spinner"></div>
                  <p>Processing your document...</p>
                </div>
              )}
              
              {error && (
                <div className="error-card">
                  <div className="error-icon">!</div>
                  <div className="error-message">Error: {error}</div>
                </div>
              )}
              
              <div className="supported-formats">
                <h3>Supported Formats:</h3>
                <div className="format-badges">
                  <span className="format-badge">PDF</span>
                  <span className="format-badge">DOCX</span>
                  <span className="format-badge">TXT</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="viewer-container">
            <div className="header-bar">
              <button className="btn back-btn" onClick={() => setDocumentData(null)}>
                <span className="btn-icon">←</span>
                Upload New Document
              </button>
              <div className="file-info">
                <span className="file-icon">
                  {documentData.fileType === 'pdf' ? '📄' : 
                   documentData.fileType === 'docx' ? '📝' : '📋'}
                </span>
                <span className="file-name">{documentData.fileName}</span>
              </div>
            </div>
            
            <DocumentViewer documentData={documentData} />
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <p>Document Reader MVP © {new Date().getFullYear()}</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}

export default App;