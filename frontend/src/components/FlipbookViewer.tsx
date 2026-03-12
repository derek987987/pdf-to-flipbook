import { useEffect, useRef, useState } from 'react';
import { PageFlip } from 'page-flip';
import ThumbnailsStrip from './ThumbnailsStrip';
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

  // Handle initialization after metadata is loaded and images are in DOM
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
        maxShadowOpacity: 0.5, // Enhanced shadows for 3D depth
        showCover: true,
        mobileScrollSupport: true,
        usePortrait: isMobile,
        flippingTime: 1000, // Slightly slower for smoother curving effect
        showPageCorners: false, // Disable hover corner curling
        disableCanvasContextMenu: true,
        clickEventForward: true,
        useMouseEvents: true,
        swipeDistance: 30,
        drawShadow: true, // Enable shadows during flip
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
  const handleFirst = () => pageFlip.current?.flip(0);
  const handleLast = () => pageFlip.current?.flip((metadata?.page_count || 1) - 1);

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
