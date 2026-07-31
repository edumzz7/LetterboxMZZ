import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Clarity from '@microsoft/clarity'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './ErrorBoundary.tsx'

const clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID

if (clarityProjectId) {
  Clarity.init(clarityProjectId)
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </QueryClientProvider>
    <Analytics />
  </StrictMode>,
)
