interface ThumbnailsStripProps {
  pages: string[];
  onSelect: (index: number) => void;
}

const ThumbnailsStrip: React.FC<ThumbnailsStripProps> = ({ pages, onSelect }) => {
  return (
    <div className="thumbnails-strip" style={{ display: 'flex', overflowX: 'auto', gap: '10px', padding: '10px' }}>
      {pages.map((url, index) => (
        <div 
          key={index} 
          className="thumbnail-item" 
          onClick={() => onSelect(index)}
          style={{ cursor: 'pointer', flex: '0 0 auto' }}
        >
          <img 
            src={url} 
            alt={`Page ${index + 1}`} 
            style={{ height: '100px', border: '1px solid #ccc' }} 
          />
          <p style={{ textAlign: 'center', margin: 0 }}>{index + 1}</p>
        </div>
      ))}
    </div>
  );
};

export default ThumbnailsStrip;
