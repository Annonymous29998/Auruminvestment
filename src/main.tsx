import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AppProviders } from '@/app/providers/AppProviders'
import App from '@/app/App'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AppProviders>
      <App />
    </AppProviders>
  </BrowserRouter>,
)
