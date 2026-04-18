# Face Sorter

A privacy-first web app that groups people in your photos by face, lets you filter by person, and downloads matching photos as a ZIP — all running entirely in your browser. No data is uploaded or stored anywhere.

## What it does

- Upload multiple photos at once
- Automatically detects and groups faces by person
- Shows each person ranked by number of appearances
- Filter photos by selecting one or more people (OR / AND mode)
- Download filtered photos as a ZIP file

## How it works

Face detection and recognition runs locally in your browser using [face-api.js](https://github.com/justadudewhohacks/face-api.js), powered by TensorFlow.js. Your photos never leave your device.

## Tech Stack

- React + Vite
- face-api.js (SSD MobileNetV1 + FaceLandmark68Net + FaceRecognitionNet)
- JSZip + file-saver
- Deployed on Vercel

## Running locally

```bash
git clone https://github.com/Arushi1104/face-sorter.git
cd face-sorter
npm install
npm run dev
```

## Limitations

- Works best with clear, reasonably sized faces
- Processing time increases with number of photos
- Very small or obscured faces may not be detected
- No identity recognition — people are grouped by similarity, not named

## Live Demo

[face-sorter-ruby.vercel.app](https://face-sorter-ruby.vercel.app)

