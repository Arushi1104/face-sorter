import { useRef } from 'react';

export default function Upload({ onPhotosSelected, disabled }) {
  const inputRef = useRef();

  const handleFiles = (files) => {
    const images = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (images.length > 0) onPhotosSelected(images);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => !disabled && inputRef.current.click()}
      style={{
        border: '2px dashed #666',
        borderRadius: '12px',
        padding: '48px',
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'border-color 0.2s',
      }}
    >
      <p style={{ fontSize: '1.1rem', margin: 0 }}>📁 Drag & drop photos here, or click to select</p>
      <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '8px' }}>Photos never leave your device</p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}