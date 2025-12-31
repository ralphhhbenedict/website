import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initMixpanel } from './lib/mixpanel'

// Initialize Mixpanel (page views tracked by usePortfolioAnalytics)
initMixpanel()

createRoot(document.getElementById("root")!).render(<App />);
