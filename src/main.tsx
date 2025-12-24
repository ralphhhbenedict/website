import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initMixpanel, trackPageView } from './lib/mixpanel'

// Initialize Mixpanel
initMixpanel()
trackPageView('Home')

createRoot(document.getElementById("root")!).render(<App />);
