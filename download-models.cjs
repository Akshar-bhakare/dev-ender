const fs = require('fs');
const https = require('https');
const path = require('path');

const BASE_URL = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/';
const MODELS_DIR = path.join(__dirname, 'backend', 'models', 'face-api');

const files = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model.json',
  'ssd_mobilenetv1_model.weights.bin',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model.json',
  'face_landmark_68_model.weights.bin',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model.json',
  'face_recognition_model.weights.bin'
];

if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

console.log('Downloading face-api models...');

let completed = 0;

files.forEach(file => {
  const fileUrl = BASE_URL + file;
  const destPath = path.join(MODELS_DIR, file);

  if (fs.existsSync(destPath)) {
    console.log(`Skipping ${file} - already exists.`);
    completed++;
    if (completed === files.length) console.log('All models downloaded.');
    return;
  }

  const fileStream = fs.createWriteStream(destPath);
  https.get(fileUrl, (response) => {
    response.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`Downloaded ${file}`);
      completed++;
      if (completed === files.length) console.log('All models downloaded.');
    });
  }).on('error', (err) => {
    fs.unlink(destPath, () => {}); // Delete the file async
    console.error(`Error downloading ${file}: ${err.message}`);
  });
});
