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

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

  const updateDimensions = () => {
    if (!metadata) return;
    
    const isMobile = window.innerWidth < 768;
    // Available width for the whole book spread (2 pages)
    const availableWidth = window.innerWidth - (isMobile ? 40 : 120);
    // Available height for the book
    const availableHeight = window.innerHeight - 300; // Room for header/controls
    
    const baseWidth = metadata.width || 550;
    const baseHeight = metadata.height || 733;
    const aspectRatio = baseHeight / baseWidth;
    
    // Target single page width
    let pageWidth = isMobile ? availableWidth : availableWidth / 2;
    let pageHeight = pageWidth * aspectRatio;
    
    // If height is too tall for screen, scale down based on height
    if (pageHeight > availableHeight) {
      pageHeight = availableHeight;
      pageWidth = pageHeight / aspectRatio;
    }

    // Don't let it get too huge on giant monitors
    const maxPageWidth = 800;
    if (pageWidth > maxPageWidth) {
      pageWidth = maxPageWidth;
      pageHeight = pageWidth * aspectRatio;
    }
    
    setDimensions({ 
      width: Math.round(pageWidth), 
      height: Math.round(pageHeight) 
    });
  };

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [metadata]);

  useEffect(() => {
    if (metadata && dimensions.width > 0 && flipbookRef.current && !pageFlip.current) {
      const isMobile = window.innerWidth < 768;

      const settings = {
        width: dimensions.width,
        height: dimensions.height,
        size: 'stretch',
        minWidth: 315,
        maxWidth: 1500,
        minHeight: 420,
        maxHeight: 2000,
        maxShadowOpacity: 0.5,
        showCover: false, /* Using invisible page workaround instead */
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
            
            // Start at the first "real" page (index 0 is the invisible left page)
            pageFlip.current.turnToPage(0);
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
  }, [metadata, dimensions.width]);

  const handleNext = () => pageFlip.current?.flipNext();
  const handlePrev = () => pageFlip.current?.flipPrev();
  const handleFirst = () => pageFlip.current?.turnToPage(0);
  const handleLast = () => {
    if (!metadata) return;
    // With invisible page at start:
    // P1 (Right) is index 0-1 spread
    // Last real page index ismetadata.page_count
    pageFlip.current?.turnToPage(metadata.page_count);
  };

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
          minHeight: `${dimensions.height + 120}px`,
          width: '100%'
        }}
      >
        {!isReady && <div className="loading-overlay">Preparing your book...</div>}
        
        <div className="container" ref={flipbookRef}>
          {/* Workaround: Invisible Left Page to allow Page 1 (Cover) to flip smoothly */}
          <div className="page page-transparent" data-density="soft" style={{ width: dimensions.width, height: dimensions.height }}>
            <div className="page-content"></div>
          </div>

          {metadata.pages.map((url, index) => (
            <div 
              className="page" 
              key={index} 
              data-density="soft"
              style={{ 
                width: `${dimensions.width}px`,
                height: `${dimensions.height}px`
              }}
            >
              <div className="page-content">
                <img 
                  src={url} 
                  alt={`Page ${index + 1}`} 
                  loading="lazy"
                />
              </div>
            </div>
          ))}

          {/* Workaround: Invisible Right Page if needed to balance the last page spread */}
          {(metadata.page_count % 2 === 0) && (
            <div className="page page-transparent" data-density="soft" style={{ width: dimensions.width, height: dimensions.height }}>
              <div className="page-content"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlipbookViewer;
