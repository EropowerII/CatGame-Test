import React, { useState } from 'react';
import HubScreen from './screens/HubScreen';
import GameScreen from './screens/GameScreen';
import { Episode } from './systems/EpisodeManager';

export default function App() {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);

  const handleSelectEpisode = (episode: Episode) => {
    setCurrentEpisode(episode);
  };

  const handleExitGame = () => {
    setCurrentEpisode(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f2ed] overflow-x-hidden">
      {!currentEpisode ? (
        <HubScreen onSelectEpisode={handleSelectEpisode} />
      ) : (
        <GameScreen episode={currentEpisode} onExit={handleExitGame} />
      )}
    </div>
  );
}
