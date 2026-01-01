import { Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import LobbyScreen from './screens/LobbyScreen';
import GameScreen from './screens/GameScreen';
import ResultsScreen from './screens/ResultsScreen';

export default function App() {
  return (
    <div className="min-h-screen bg-darker text-white">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/lobby/:roomCode" element={<LobbyScreen />} />
        <Route path="/game/:roomCode" element={<GameScreen />} />
        <Route path="/results/:roomCode" element={<ResultsScreen />} />
      </Routes>
    </div>
  );
}
