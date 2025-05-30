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
      <header>
        <h1>Interactive Document Reader</h1>
      </header>
      
      <main>
        {!documentData ? (
          <div className="upload-container">
            <Uploader onFileUpload={handleFileUpload} />
            {isLoading && <div className="loader">Processing document...</div>}
            {error && <div className="error">Error: {error}</div>}
          </div>
        ) : (
          <div className="viewer-container">
            <div className="header-bar">
              <button className="btn" onClick={() => setDocumentData(null)}>
                ← Upload New Document
              </button>
              <span className="file-name">{documentData.fileName}</span>
            </div>
            <DocumentViewer documentData={documentData} />
          </div>
        )}
      </main>
      
      <footer>
        <p>Document Reader MVP © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;