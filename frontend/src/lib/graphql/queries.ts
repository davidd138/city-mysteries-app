export const LIST_MYSTERIES = /* GraphQL */ `
  query ListMysteries {
    listMysteries {
      id title description city location { lat lng } radius difficulty
      characters { characterId name historicalPeriod description statue { lat lng name } voice }
      solution active briefing imageUrl createdAt
    }
  }
`;

export const GET_MYSTERY = /* GraphQL */ `
  query GetMystery($id: String!) {
    getMystery(id: $id) {
      id title description city location { lat lng } radius difficulty
      characters { characterId mysteryId name historicalPeriod description statue { lat lng name } clues voice persona }
      solution active briefing imageUrl createdAt
    }
  }
`;

export const GET_GAME_SESSION = /* GraphQL */ `
  query GetGameSession($id: String!) {
    getGameSession(id: $id) {
      id mysteryId mysteryTitle userId status
      interactions { sessionId characterId characterName transcript cluesRevealed timestamp }
      startedAt completedAt solved
    }
  }
`;

export const LIST_GAME_SESSIONS = /* GraphQL */ `
  query ListGameSessions($limit: Int, $nextToken: String) {
    listGameSessions(limit: $limit, nextToken: $nextToken) {
      items { id mysteryId mysteryTitle status startedAt completedAt solved }
      nextToken
    }
  }
`;

export const GET_USER_PROFILE = /* GraphQL */ `
  query GetUserProfile {
    getUserProfile {
      userId email name totalGames gamesSolved successRate memberSince
    }
  }
`;

export const GET_REALTIME_TOKEN = /* GraphQL */ `
  query GetRealtimeToken($characterId: String!, $mysteryId: String!) {
    getRealtimeToken(characterId: $characterId, mysteryId: $mysteryId) {
      token expiresAt
    }
  }
`;
