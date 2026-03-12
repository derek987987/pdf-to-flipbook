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
  width: number;
  height: number;
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
      
      // Calculate dynamic dimensions
      // Use original aspect ratio but cap maximum width
      const maxDisplayWidth = Math.min(window.innerWidth - 100, 1200);
      const baseWidth = metadata.width || 550;
      const baseHeight = metadata.height || 733;
      
      const scaleFactor = (maxDisplayWidth / 2) / baseWidth;
      
      const pageWidth = isMobile ? Math.min(window.innerWidth - 40, baseWidth) : baseWidth * scaleFactor;
      const pageHeight = isMobile ? (pageWidth / baseWidth) * baseHeight : baseHeight * scaleFactor;

      const settings = {
        width: Math.round(pageWidth),
        height: Math.round(pageHeight),
        size: 'stretch',
        minWidth: 315,
        maxWidth: 1500,
        minHeight: 420,
        maxHeight: 2000,
        maxShadowOpacity: 0.5,
        showCover: false,
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
  const handleFirst = () => pageFlip.current?.turnToPage(1);
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
          visibility: isReady ? 'visible' : 'hidden',
          minHeight: `${Math.round((metadata.height / metadata.width) * (isReady ? 550 : 550))}px`
        }}
      >
        {!isReady && <div className="loading-overlay">Preparing your book...</div>}
        
        <div className="container" ref={flipbookRef}>
          <div className="page" data-density="hard" style={{ backgroundColor: 'transparent' }}></div>
          
          {metadata.pages.map((url, index) => (
            <div 
              className="page" 
              key={index} 
              data-density="soft"
              style={{ 
                width: `${Math.round(metadata.width * ((Math.min(window.innerWidth - 100, 1200) / 2) / metadata.width))}px`,
                height: `${Math.round(metadata.height * ((Math.min(window.innerWidth - 100, 1200) / 2) / metadata.width))}px`
              }}
            >
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
