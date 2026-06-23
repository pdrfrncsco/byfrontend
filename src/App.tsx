import { AppProvider } from '@/app/providers'
import { useTheme } from '@/app/providers/ThemeProvider'

function AppContent() {
  const { theme } = useTheme()

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            BolaYetu Frontend
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Enterprise-grade Football Ecosystem Platform
          </p>
          <div className="inline-flex gap-4 flex-wrap justify-center">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Build Tool</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">Vite</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Language</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">TypeScript</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Styling</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">Tailwind CSS</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">State</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">Zustand</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Data Fetching</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">TanStack Query</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">i18n</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">i18next</p>
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-12 text-sm">
            ✅ Setup completo! Estrutura, dependências e providers configurados.
          </p>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
