import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppProvider } from '@/app/providers'
import { AppRoutes } from '@/app/routes/AppRoutes'

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0b1c30',
              border: '1px solid #26364a',
              color: '#d3e4fe',
            },
          }}
        />
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
