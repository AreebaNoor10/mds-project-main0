const fs = require('fs');
const path = require('path');

// Path to the PDF.js worker file - updated for pdfjs-dist 4.8.69
const workerPath = path.resolve(
  __dirname,
  '../node_modules/pdfjs-dist/build/pdf.worker.min.mjs'
);

// Destination path in the public directory
const destPath = path.resolve(__dirname, '../public/pdf.worker.min.mjs');

// Copy the worker file to the public directory
try {
  fs.copyFileSync(workerPath, destPath);
  console.log('PDF.js worker file copied successfully!');
} catch (error) {
  console.error('Error copying PDF.js worker file:', error);
} 