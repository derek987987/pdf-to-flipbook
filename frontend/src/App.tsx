import { useState } from 'react'
import UploadForm from './components/UploadForm'
import FlipbookViewer from './components/FlipbookViewer'

function App() {
  const [documentId, setDocumentId] = useState<string | null>(null)

  const handleUploadSuccess = (id: string) => {
    setDocumentId(id)
  }

  return (
    <div className="App">
      <header style={{ padding: '20px', textAlign: 'center' }}>
        <h1>PDF to Flipbook</h1>
      </header>
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {!documentId ? (
          <UploadForm onSuccess={handleUploadSuccess} />
        ) : (
          <div>
            <button 
              onClick={() => setDocumentId(null)}
              style={{ marginBottom: '20px' }}
            >
              Upload Another PDF
            </button>
            <FlipbookViewer documentId={documentId} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
