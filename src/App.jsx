import { useState, useRef } from 'react';
import Upload from './components/Upload';
import PersonCard from './components/PersonCard';
import FilterBar from './components/FilterBar';
import { loadModels, detectFaces, clusterFaces } from './lib/faceApi';
import { downloadZip } from './lib/zipper';

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [people, setPeople] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [mode, setMode] = useState('OR');
  const [status, setStatus] = useState('idle'); // idle | loading | done
  const [progress, setProgress] = useState('');
  const modelsLoaded = useRef(false);

  const handlePhotosSelected = async (files) => {
    setStatus('loading');
    setProgress('Loading face detection models...');
    setPeople([]);
    setSelected(new Set());
    setPhotos(files);

    if (!modelsLoaded.current) {
      await loadModels();
      modelsLoaded.current = true;
    }

    const allDetections = [];

    for (let i = 0; i < files.length; i++) {
      setProgress(`Scanning photo ${i + 1} of ${files.length}...`);
      const url = URL.createObjectURL(files[i]);
      const img = await createImageElement(url);
      const detections = await detectFaces(img);
      for (const det of detections) {
        allDetections.push({ photoIndex: i, detection: det });
      }
      URL.revokeObjectURL(url);
    }

    setProgress('Grouping faces...');
    const clustered = clusterFaces(allDetections);

    // Extract face thumbnails
    const peopleWithThumbs = await Promise.all(
      clustered.map(async (person) => {
        const { photoIndex, detection } = findBestFace(person, allDetections);
        const url = URL.createObjectURL(files[photoIndex]);
        const img = await createImageElement(url);
        const faceCanvas = extractFace(img, detection.detection.box);
        URL.revokeObjectURL(url);
        return { ...person, faceCanvas };
      })
    );

    setPeople(peopleWithThumbs);
    setStatus('done');
    setProgress('');
  };

  const togglePerson = (index) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const getMatchingPhotos = () => {
    if (selected.size === 0) return new Set();
    const selectedPeople = [...selected].map(i => people[i]);

    if (mode === 'OR') {
      const indices = new Set();
      for (const p of selectedPeople)
        for (const idx of p.photoIndices) indices.add(idx);
      return indices;
    } else {
      // AND — intersection
      let indices = new Set(selectedPeople[0].photoIndices);
      for (const p of selectedPeople.slice(1))
        indices = new Set([...indices].filter(x => p.photoIndices.has(x)));
      return indices;
    }
  };

  const matchingIndices = getMatchingPhotos();

  const handleDownload = () => {
    downloadZip(photos, [...matchingIndices]);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      color: '#f0f0f0',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '32px 24px',
      maxWidth: '900px',
      margin: '0 auto',
    }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Face Sorter</h1>
      <p style={{ color: '#888', marginBottom: '32px', marginTop: 0 }}>
      Upload photos — group, filter & download by person. Nothing is stored or sent anywhere. Processing may take a moment depending on the number of photos.
      </p>

      <Upload
        onPhotosSelected={handlePhotosSelected}
        disabled={status === 'loading'}
      />

      {status === 'loading' && (
        <div style={{ marginTop: '24px', color: '#4f8ef7', fontSize: '0.95rem' }}>
          ⏳ {progress}
        </div>
      )}

      {status === 'done' && people.length === 0 && (
        <div style={{ marginTop: '24px', color: '#f87' }}>
          No faces detected in the uploaded photos.
        </div>
      )}

      {people.length > 0 && (
        <>
          <div style={{ marginTop: '32px' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
              👥 {people.length} people found — select who to filter by
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {people.map((person, i) => (
                <PersonCard
                  key={i}
                  person={person}
                  index={i}
                  selected={selected.has(i)}
                  onToggle={togglePerson}
                />
              ))}
            </div>
          </div>

          <div style={{
            marginTop: '32px',
            padding: '20px',
            background: '#1a1a1a',
            borderRadius: '12px',
          }}>
            <FilterBar
              mode={mode}
              onModeChange={setMode}
              onDownload={handleDownload}
              matchCount={matchingIndices.size}
              hasSelection={selected.size > 0}
            />
          </div>

          {selected.size > 0 && (
            <p style={{ marginTop: '12px', color: '#aaa', fontSize: '0.85rem' }}>
              {matchingIndices.size} photo{matchingIndices.size !== 1 ? 's' : ''} match your selection
            </p>
          )}
        </>
      )}
    </div>
  );
}

// Helpers
function createImageElement(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = url;
  });
}

function findBestFace(person, allDetections) {
  for (const det of allDetections) {
    if (person.photoIndices.has(det.photoIndex) &&
        person.descriptors.some(d =>
          Math.min(...person.descriptors.map(pd =>
            pd === det.detection.descriptor ? 0 : 1
          )) === 0 || det.detection.descriptor === person.descriptors[0]
        )) {
      return det;
    }
  }
  return allDetections.find(d => person.photoIndices.has(d.photoIndex));
}

function extractFace(img, box) {
  const canvas = document.createElement('canvas');
  canvas.width = 80;
  canvas.height = 80;
  const ctx = canvas.getContext('2d');
  const pad = 20;
  ctx.drawImage(
    img,
    Math.max(0, box.x - pad),
    Math.max(0, box.y - pad),
    box.width + pad * 2,
    box.height + pad * 2,
    0, 0, 80, 80
  );
  return canvas;
}