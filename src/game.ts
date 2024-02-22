import { Engine, Render, Bodies, World, Body, Runner, Events } from 'matter-js';

const BODY_LABEL = {
  PLAYER: 'player',
  BLOCK: 'block',
  GROUND: 'ground',
};

const GAME_STATUS = {
  READY: 'ready',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
} as const;

const MAX_JUMP_COUNT = 2;
type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];

export class Game {
  static RENDER_WIDTH = 1200;
  static RENDER_HEIGHT = 600;
  static PLAYER_CENTER = 300;

  private jumpCount: number = MAX_JUMP_COUNT;

  private engine: Engine;
  private render: Render;
  private runner: Runner;

  private player: Body;
  private block: Body;
  private ground: Body;
  private gameStatus: GameStatus = GAME_STATUS.READY;

  constructor() {
    this.engine = Engine.create();
    this.render = Render.create({
      element: document.getElementById('game')!,
      engine: this.engine,
      options: {
        width: Game.RENDER_WIDTH,
        height: Game.RENDER_HEIGHT,
        wireframes: false, // ワイヤーフレームの表示を無効化
        background: 'transparent', // 背景を透明に設定
        hasBounds: true, // ビューのスクロールを有効化
      },
    });

    // createGameObjectsで初期化をするが、エラーを回避するためダミーで明示的に初期化
    this.player = Bodies.rectangle(0, 0, 0, 0);
    this.block = Bodies.rectangle(0, 0, 0, 0);
    this.ground = Bodies.rectangle(0, 0, 0, 0);
    this.createGameObjects();

    Events.on(this.engine, 'afterUpdate', () => {
      this.updateView();

      if (this.player.position.y > Game.RENDER_HEIGHT) {
        this.gameOver();
      }
    });

    Events.on(this.engine, 'collisionStart', (event) => {
      this.resetJumpCount(event);
    });

    this.runner = Runner.create();
    Runner.run(this.runner, this.engine);
    Render.run(this.render);

    this.registerEvents();

    document.getElementById('restart-button')?.addEventListener('click', () => {
      this.resetGame();
    });
  }

  private resetJumpCount(event: Matter.IEventCollision<Engine>) {
    for (const pair of event.pairs) {
      if (
        (pair.bodyA === this.player && pair.bodyB.label === BODY_LABEL.BLOCK) ||
        (pair.bodyB === this.player && pair.bodyB.label === BODY_LABEL.BLOCK) ||
        (pair.bodyA === this.player && pair.bodyB.label === BODY_LABEL.GROUND) ||
        (pair.bodyB === this.player && pair.bodyB.label === BODY_LABEL.GROUND)
      ) {
        this.jumpCount = 0;
      }
    }
  }

  private createGameObjects() {
    // プレイヤーの作成
    this.player = Bodies.rectangle(Game.PLAYER_CENTER, 400, 40, 80, {
      label: 'player',
      render: {
        sprite: {
          texture: '/images/player.png',
          xScale: 1,
          yScale: 1,
        },
      },
    });

    // 敵の作成（簡易的な例）
    this.block = Bodies.rectangle(400, 500, 20, 20, { label: BODY_LABEL.BLOCK, isStatic: true });
    this.ground = Bodies.rectangle(155, 600, 300, 30, { isStatic: true, label: BODY_LABEL.GROUND });
    World.add(this.engine.world, [this.player, this.block, this.ground]);
  }

  private updateView() {
    if (this.player.position.x > Game.PLAYER_CENTER) {
      const offsetX = this.player.position.x - Game.PLAYER_CENTER;
      this.render.bounds.min.x = offsetX;
      this.render.bounds.max.x = offsetX + (this.render.options.width ?? 0);
    } else {
      this.render.bounds.min.x = 0;
      this.render.bounds.max.x = this.render.options.width ?? 0;
    }
  }

  private gameOver() {
    this.gameStatus = GAME_STATUS.GAME_OVER;
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) {
      gameOverScreen.style.display = 'flex'; // ゲームオーバー画面を表示
    }
  }

  private resetGame() {
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) {
      gameOverScreen.style.display = 'none';
    }
    World.clear(this.engine.world, false);
    this.createGameObjects();
    Engine.clear(this.engine);
  }

  private jumpForce() {
    return this.jumpCount === 0 ? -0.07 : -0.09;
  }

  private registerEvents() {
    window.addEventListener('keydown', (event) => {
      const force = 0.03;
      switch (event.key) {
        case 'ArrowLeft':
          Body.applyForce(this.player, this.player.position, { x: -force, y: 0 });
          break;
        case 'ArrowRight':
          Body.applyForce(this.player, this.player.position, { x: force, y: 0 });
          break;
        case ' ':
          if (this.jumpCount < MAX_JUMP_COUNT) {
            console.log('Game  this.jumpCount:', this.jumpCount);
            Body.applyForce(this.player, this.player.position, { x: 0, y: this.jumpForce() });
            this.jumpCount++;
          }
          break;
        case 'r':
          this.resetGame();
          break;
      }
    });
  }
}
