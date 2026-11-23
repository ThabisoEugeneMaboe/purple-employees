import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from './theme/ThemeContext'
import './styles/index.css'

// Mounts the React application into the root element defined in index.html.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      {/* Enables client-side routing throughout the application. */}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)