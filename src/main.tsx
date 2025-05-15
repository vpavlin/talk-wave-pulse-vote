
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Buffer } from 'buffer'

// Make Buffer available globally for libraries that might need it
window.Buffer = Buffer;

createRoot(document.getElementById("root")!).render(<App />);
