export const SYNC_USER = /* GraphQL */ `
  mutation SyncUser {
    syncUser { userId email name status createdAt }
  }
`;

export const START_GAME = /* GraphQL */ `
  mutation StartGame($input: StartGameInput!) {
    startGame(input: $input) {
      id mysteryId mysteryTitle userId status startedAt
    }
  }
`;

export const RECORD_INTERACTION = /* GraphQL */ `
  mutation RecordInteraction($input: RecordInteractionInput!) {
    recordInteraction(input: $input) {
      sessionId characterId transcript cluesRevealed timestamp
    }
  }
`;

export const USE_HINT = /* GraphQL */ `
  mutation UseHint($sessionId: String!) {
    useHint(sessionId: $sessionId) {
      text hintsRemaining
    }
  }
`;

export const SUBMIT_SOLUTION = /* GraphQL */ `
  mutation SubmitSolution($input: SubmitSolutionInput!) {
    submitSolution(input: $input) {
      correct message
      session { id mysteryId status completedAt solved score elapsedSeconds }
    }
  }
`;
