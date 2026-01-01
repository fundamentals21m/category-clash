import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { GameProvider } from './context/GameContext';
import { SocketProvider } from './context/SocketContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <GameProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </GameProvider>
    </BrowserRouter>
  </React.StrictMode>
);
