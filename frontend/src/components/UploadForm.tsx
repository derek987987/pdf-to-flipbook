import { useState, useRef } from 'react';
import { useUpload } from '../hooks/useUpload';

interface UploadFormProps {
  onSuccess: (id: string) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading, status, error } = useUpload(onSuccess);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      uploadFile(file);
    }
  };

  return (
    <div className="upload-container">
      <h2>Transform your PDF into a digital heirloom.</h2>
      
      <form onSubmit={handleSubmit}>
        <div 
          className="dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="dropzone-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5V19M5 12H19" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef}
            accept=".pdf" 
            onChange={handleFileChange} 
            style={{ display: 'none' }}
          />
          
          {!file ? (
            <p>Drag your manuscript here or click to browse</p>
          ) : (
            <p className="file-name">Selected: {file.name}</p>
          )}
          
          <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>PDF files only, up to 500MB</p>
        </div>

        <button 
          className="upload-button" 
          type="submit" 
          disabled={!file || isUploading}
        >
          {isUploading ? 'Preparing Manuscript...' : 'Create Flipbook'}
        </button>
      </form>

      {status && (
        <div className="status" style={{ marginTop: '40px', fontStyle: 'italic', opacity: 0.7 }}>
          <p>{status === 'PROCESSING' ? 'Weaving the pages together...' : `Current status: ${status}`}</p>
        </div>
      )}

      {error && <p className="error" style={{ color: '#c55959', marginTop: '20px' }}>{error}</p>}
    </div>
  );
};

export default UploadForm;
