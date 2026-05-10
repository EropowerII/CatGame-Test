
export interface Episode {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  backgroundUrl: string;
}

export class EpisodeManager {
  private static instance: EpisodeManager;
  private episodes: Episode[] = [
    {
      id: "1",
      title: "Episode 1: The New Room",
      description: "Explore the cozy living room and learn the basics.",
      isUnlocked: true,
      backgroundUrl: "Assets/Backgrounds/LivingRoom_Morning.png",
    },
    { id: "2", title: "Episode 2: Locked", description: "Comming soon...", isUnlocked: false, backgroundUrl: "" },
    { id: "3", title: "Episode 3: Locked", description: "Comming soon...", isUnlocked: false, backgroundUrl: "" },
    { id: "4", title: "Episode 4: Locked", description: "Comming soon...", isUnlocked: false, backgroundUrl: "" },
    { id: "5", title: "Episode 5: Locked", description: "Comming soon...", isUnlocked: false, backgroundUrl: "" },
    { id: "6", title: "Episode 6: Locked", description: "Comming soon...", isUnlocked: false, backgroundUrl: "" },
    { id: "7", title: "Episode 7: Locked", description: "Comming soon...", isUnlocked: false, backgroundUrl: "" },
  ];

  private constructor() {}

  public static getInstance(): EpisodeManager {
    if (!EpisodeManager.instance) {
      EpisodeManager.instance = new EpisodeManager();
    }
    return EpisodeManager.instance;
  }

  public getEpisodes(): Episode[] {
    return this.episodes;
  }

  public getEpisode(id: string): Episode | undefined {
    return this.episodes.find((e) => e.id === id);
  }
}
