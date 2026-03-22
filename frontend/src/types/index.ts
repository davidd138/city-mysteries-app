export type User = {
  userId: string;
  email: string;
  name: string | null;
  status: string;
  createdAt: string | null;
};

export type Location = {
  lat: number;
  lng: number;
};

export type StatueLocation = {
  lat: number;
  lng: number;
  name: string;
};

export type Character = {
  characterId: string;
  mysteryId: string;
  name: string;
  historicalPeriod: string;
  description: string;
  statue: StatueLocation;
  clues: string[];
  voice: string | null;
  persona: string;
};

export type Mystery = {
  id: string;
  title: string;
  description: string;
  city: string;
  location: Location;
  radius: number;
  difficulty: string;
  characters: Character[] | null;
  solution: string;
  active: boolean;
  briefing: string | null;
  imageUrl: string | null;
  createdAt: string | null;
};

export type Interaction = {
  sessionId: string;
  characterId: string;
  characterName: string | null;
  transcript: string | null;
  cluesRevealed: string[] | null;
  timestamp: string;
};

export type GameSession = {
  id: string;
  mysteryId: string;
  mysteryTitle: string | null;
  userId: string;
  status: string;
  interactions: Interaction[] | null;
  startedAt: string;
  completedAt: string | null;
  solved: boolean | null;
};

export type GameSessionList = {
  items: GameSession[];
  nextToken: string | null;
};

export type GameResult = {
  correct: boolean;
  message: string;
  session: GameSession;
};

export type RealtimeToken = {
  token: string;
  expiresAt: number;
};

export type UserProfile = {
  userId: string;
  email: string;
  name: string | null;
  totalGames: number;
  gamesSolved: number;
  successRate: number;
  memberSince: string | null;
};

export type TrainingState = 'idle' | 'connecting' | 'connected' | 'listening' | 'speaking' | 'error';
