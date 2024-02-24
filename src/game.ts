import { Engine, Render, Bodies, World, Body, Runner, Events } from 'matter-js';
import { BODY_LABEL, GAME_STATUS } from './consts/game';

function createSpikeBlock(x: number, y: number, width: number, height: number) {
  // 下部の正方形（四角形）
  // 下部の四角形（正方形の場合はwidthとheightが同じになる）
  const baseHeight = height / 2; // 四角形の高さ
  const base = Bodies.rectangle(x, y + baseHeight / 2, width, baseHeight, { isStatic: true });

  // 上部の三角形
  const spikeHeight = height / 2;
  // 三角形の中心位置を四角形の上辺に合わせる
  // y座標は四角形の上辺のy座標から三角形の高さの半分を引いた位置
  const spike = Bodies.polygon(x, y - spikeHeight + baseHeight / 2, 3, spikeHeight, {
    isStatic: true,
    angle: Math.PI / 2,
    label: BODY_LABEL.SPIKE,
    render: {
      fillStyle: 'gray',
    },
  });
  // 複合体を作成
  const spikeBlock = Body.create({
    parts: [base, spike], // 二つの部品を組み合わせる
    isStatic: true,
    label: BODY_LABEL.SPIKE_BLOCK,
  });

  return spikeBlock;
}

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

    Events.on(this.engine, 'collisionStart', (event) => {
      for (let pair of event.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        // プレイヤーとトゲブロックの衝突を検出
        if (labels.includes(BODY_LABEL.PLAYER) && labels.includes(BODY_LABEL.SPIKE)) {
          this.gameOver();
        }
      }
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

    // this.ground = Bodies.rectangle(155, 600, 300, 30, { isStatic: true, label: BODY_LABEL.GROUND });
    this.ground = Bodies.rectangle(155, 600, 1000, 30, { isStatic: true, label: BODY_LABEL.GROUND });

    // トゲブロックの作成
    const spike = createSpikeBlock(600, 500, 40, 40);
    World.add(this.engine.world, [this.player, this.block, this.ground, spike]);
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
    return this.jumpCount === 0 ? -0.09 : -0.09;
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
