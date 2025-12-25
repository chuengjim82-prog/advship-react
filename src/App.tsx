import { Toaster } from '@/components/ui/sonner'
import AppRouter from '@/routes'

function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="top-center" />
    </>
  )
}

export default App
