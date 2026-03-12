import { useState, useCallback } from 'react';

export type Status = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';

interface StatusResponse {
  id: string;
  status: Status;
  error?: string;
}

export const useUpload = (onSuccess: (id: string) => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollStatus = useCallback(async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/v1/status/${id}`);
        const data: StatusResponse = await response.json();
        
        setStatus(data.status);
        
        if (data.status === 'COMPLETED') {
          clearInterval(interval);
          onSuccess(id);
        } else if (data.status === 'ERROR') {
          clearInterval(interval);
          setError(data.error || 'Conversion failed');
        }
      } catch (err) {
        clearInterval(interval);
        setError('Failed to poll status');
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [onSuccess]);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setStatus('PENDING');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Upload failed');
      }

      const data = await response.json();
      pollStatus(data.id);
    } catch (err: any) {
      setError(err.message);
      setIsUploading(false);
      setStatus(null);
    }
  };

  return { uploadFile, isUploading, status, error };
};
