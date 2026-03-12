import { useState } from 'react';
import { useUpload } from '../hooks/useUpload';

interface UploadFormProps {
  onSuccess: (id: string) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const { uploadFile, isUploading, status, error } = useUpload(onSuccess);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      uploadFile(file);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload PDF to Flipbook</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange} 
          disabled={isUploading} 
        />
        <button type="submit" disabled={!file || isUploading}>
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {status && (
        <div className="status">
          <p>Status: {status}</p>
          {status === 'PROCESSING' && <p>Converting PDF to images...</p>}
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default UploadForm;
