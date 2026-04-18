import * as faceapi from 'face-api.js';

export async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
}

export async function detectFaces(imageElement) {
  return await faceapi
    .detectAllFaces(imageElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 }))
    .withFaceLandmarks()
    .withFaceDescriptors();
}

export function clusterFaces(allDetections, threshold = 0.45) {
  const people = [];

  for (const { photoIndex, detection } of allDetections) {
    const descriptor = detection.descriptor;
    let matched = false;

    for (const person of people) {
      const distances = person.descriptors.map(d =>
        faceapi.euclideanDistance(d, descriptor)
      );
      const minDist = Math.min(...distances);

      if (minDist < threshold) {
        person.descriptors.push(descriptor);
        person.photoIndices.add(photoIndex);
        matched = true;
        break;
      }
    }

    if (!matched) {
      people.push({
        descriptors: [descriptor],
        photoIndices: new Set([photoIndex]),
        faceBox: detection.detection.box,
      });
    }
  }

  return people.sort((a, b) => b.photoIndices.size - a.photoIndices.size);
}