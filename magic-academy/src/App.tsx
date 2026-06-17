import { GameProvider } from './store/GameContext'
import MainLayout from './components/MainLayout'
import './index.css'

function App() {
  return (
    <GameProvider>
      <MainLayout />
    </GameProvider>
  )
}

export default App