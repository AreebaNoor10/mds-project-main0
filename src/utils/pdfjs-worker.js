import { pdfjs } from 'react-pdf';

// This function sets up the PDF.js worker
export const setupPdfWorker = () => {
  try {
    // First try to use the local worker file
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    
    // Suppress the AbortException warnings by creating a custom error handler
    const originalConsoleError = console.error;
    console.error = function(msg, ...args) {
      // Filter out the AbortException warnings
      if (typeof msg === 'string' && 
          (msg.includes('AbortException') || 
           msg.includes('TextLayer task cancelled'))) {
        // Skip logging this error
        return;
      }
      // Pass through all other errors
      return originalConsoleError.apply(console, [msg, ...args]);
    };
    
    console.log('Using local PDF.js worker');
  } catch (error) {
    // Fallback to CDN if local worker fails
    console.log('Falling back to CDN PDF.js worker');
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  }
};

// Alternative approach using a local worker file
// This requires copying the worker file to the public directory
export const setupLocalPdfWorker = () => {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}; 