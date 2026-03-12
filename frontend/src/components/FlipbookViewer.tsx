import { useEffect, useRef, useState } from 'react';
import { PageFlip } from 'page-flip';
import '../index.css';

interface FlipbookViewerProps {
  documentId: string;
}

interface ViewerMetadata {
  id: string;
  original_name: string;
  page_count: number;
  pages: string[];
}

const FlipbookViewer: React.FC<FlipbookViewerProps> = ({ documentId }) => {
  const [metadata, setMetadata] = useState<ViewerMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const flipbookRef = useRef<HTMLDivElement>(null);
  const pageFlip = useRef<any>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch(`/api/v1/viewer/${documentId}`);
        if (!response.ok) throw new Error('Failed to fetch flipbook metadata');
        const data = await response.json();
        setMetadata(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchMetadata();
  }, [documentId]);

  useEffect(() => {
    if (metadata && flipbookRef.current && !pageFlip.current) {
      const isMobile = window.innerWidth < 768;
      
      const settings = {
        width: 550,
        height: 733,
        size: 'stretch',
        minWidth: 315,
        maxWidth: 1000,
        minHeight: 420,
        maxHeight: 1350,
        maxShadowOpacity: 0.5,
        showCover: false, // Set to false to allow soft flip on all pages
        mobileScrollSupport: true,
        usePortrait: isMobile,
        flippingTime: 1000,
        showPageCorners: false,
        disableCanvasContextMenu: true,
        clickEventForward: true,
        useMouseEvents: true,
        swipeDistance: 30,
        drawShadow: true,
        startPage: 0,
      };

      const timer = setTimeout(() => {
        try {
          if (!flipbookRef.current) return;
          
          pageFlip.current = new PageFlip(flipbookRef.current, settings);
          const pageElements = flipbookRef.current.querySelectorAll('.page');
          
          if (pageElements.length > 0) {
            pageFlip.current.loadFromHTML(pageElements);
            setIsReady(true);
            pageFlip.current.turnToPage(1);

            // Prevent flipping back to page 0
            pageFlip.current.on('flip', (e: any) => {
              if (e.data === 0) {
                pageFlip.current.turnToPage(1);
              }
            });
          }
        } catch (err) {
          console.error('Failed to initialize PageFlip:', err);
        }
      }, 500);

      return () => {
        clearTimeout(timer);
        if (pageFlip.current) {
          pageFlip.current.destroy();
          pageFlip.current = null;
        }
      };
    }
  }, [metadata]);

  const handleNext = () => pageFlip.current?.flipNext();
  const handlePrev = () => pageFlip.current?.flipPrev();
  const handleFirst = () => pageFlip.current?.turnToPage(1); // Jump to cover
  const handleLast = () => pageFlip.current?.flip(metadata ? metadata.page_count : 1);

  const toggleZoom = () => setZoom(prev => (prev === 1 ? 1.5 : 1));

  if (error) return <div className="error">{error}</div>;
  if (!metadata) return <div className="loading">Loading PDF metadata...</div>;

  return (
    <div className="flipbook-outer-container">
      <div className="controls">
        <button onClick={handleFirst}>First</button>
        <button onClick={handlePrev}>Prev</button>
        <button onClick={handleNext}>Next</button>
        <button onClick={handleLast}>Last</button>
        <button onClick={toggleZoom}>{zoom === 1 ? 'Zoom In' : 'Zoom Out'}</button>
      </div>

      <div 
        className="flipbook-wrapper" 
        style={{ 
          transform: `scale(${zoom})`, 
          transformOrigin: 'top center',
          visibility: isReady ? 'visible' : 'hidden'
        }}
      >
        {!isReady && <div className="loading-overlay">Preparing your book...</div>}
        
        <div className="container" ref={flipbookRef}>
          {/* Placeholder page 0 to force single-page cover view */}
          <div className="page" data-density="hard" style={{ backgroundColor: 'transparent' }}></div>
          
          {metadata.pages.map((url, index) => (
            <div className="page" key={index} data-density="soft">
              <div className="page-content">
                <img 
                  src={url} 
                  alt={`Page ${index + 1}`} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlipbookViewer;
