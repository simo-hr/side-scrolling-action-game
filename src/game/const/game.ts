export const BODY_LABEL = {
  PLAYER: 'player',
  BLOCK: 'block',
  SPIKE_BLOCK: 'spikeBlock',
  SPIKE: 'spike',
  GROUND: 'ground',
} as const;

export const GAME_STATUS = {
  READY: 'ready',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
} as const;

export const RENDER_WIDTH = 1200;
export const RENDER_HEIGHT = 600;
export const PLAYER_CENTER = 300;
export const MAX_JUMP_COUNT = 2;
