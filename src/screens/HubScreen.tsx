
import React from "react";
import { EpisodeManager, Episode } from "../systems/EpisodeManager";
import { Lock, Play } from "lucide-react";
import { motion } from "motion/react";

interface HubScreenProps {
  onSelectEpisode: (episode: Episode) => void;
}

export default function HubScreen({ onSelectEpisode }: HubScreenProps) {
  const episodes = EpisodeManager.getInstance().getEpisodes();

  return (
    <div className="min-h-screen bg-brand-amber p-8 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-6xl font-black text-white drop-shadow-lg uppercase tracking-tighter mb-2">
          Nappy Time
        </h1>
        <p className="text-brand-orange-dark text-xl font-bold">Select Your Adventure</p>
      </motion.div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
        {episodes.map((episode, index) => (
          <motion.div
            key={episode.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`relative rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-200 aspect-[3/4] group ${
              episode.isUnlocked 
                ? "bg-white border-4 border-brand-orange cursor-pointer hover:scale-105" 
                : "bg-gray-800 border-4 border-gray-600 opacity-80 cursor-not-allowed"
            }`}
            onClick={() => episode.isUnlocked && onSelectEpisode(episode)}
          >
            <div className={`h-2/3 bg-brand-orange/10 flex items-center justify-center overflow-hidden relative`}>
              {episode.backgroundUrl ? (
                <img 
                  src={episode.backgroundUrl} 
                  alt={episode.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl ${episode.isUnlocked ? 'bg-brand-orange' : 'bg-gray-700'}`}>
                  {episode.isUnlocked ? index + 1 : <Lock size={24} />}
                </div>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className={`text-xs font-black uppercase ${episode.isUnlocked ? 'text-brand-orange' : 'text-gray-500'}`}>
                  Episode {index + 1}
                </span>
                <h3 className={`text-lg font-bold leading-none mt-1 ${episode.isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                  {episode.isUnlocked ? episode.title : "Locked"}
                </h3>
              </div>

              {episode.isUnlocked && (
                <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full w-1/3"></div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
