import { Engine, Render, Bodies, World, Body, Runner, Events } from 'matter-js';
import { BODY_LABEL, GAME_STATUS, PLAYER_CENTER, RENDER_HEIGHT, RENDER_WIDTH } from './const/game';
import { createSpikeBlock } from './bodies/spike';
import { Player, createPlayer } from './bodies/player';

type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];

export class Game {
  private engine: Engine;
  private render: Render;
  private runner: Runner;

  private player: Player;
  private block: Body;
  private ground: Body;
  private gameStatus: GameStatus = GAME_STATUS.READY;

  constructor() {
    // プレイヤーの作成
    this.player = new Player(PLAYER_CENTER, 400, 40, 80);

    this.engine = Engine.create();
    this.render = Render.create({
      element: document.getElementById('game')!,
      engine: this.engine,
      options: {
        width: RENDER_WIDTH,
        height: RENDER_HEIGHT,
        wireframes: false, // ワイヤーフレームの表示を無効化
        background: 'transparent', // 背景を透明に設定
        hasBounds: true, // ビューのスクロールを有効化
      },
    });

    // createGameObjectsで初期化をするが、エラーを回避するためダミーで明示的に初期化

    this.block = Bodies.rectangle(0, 0, 0, 0);
    this.ground = Bodies.rectangle(0, 0, 0, 0);
    this.createGameObjects();

    Events.on(this.engine, 'afterUpdate', () => {
      this.updateView();

      if (this.player.body.position.y > RENDER_HEIGHT) {
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

    this.registerEvents();

    this.runner = Runner.create();
    Runner.run(this.runner, this.engine);
    Render.run(this.render);
  }

  private resetJumpCount(event: Matter.IEventCollision<Engine>) {
    for (const pair of event.pairs) {
      if (
        (pair.bodyA === this.player.body && pair.bodyB.label === BODY_LABEL.BLOCK) ||
        (pair.bodyB === this.player.body && pair.bodyB.label === BODY_LABEL.BLOCK) ||
        (pair.bodyA === this.player.body && pair.bodyB.label === BODY_LABEL.GROUND) ||
        (pair.bodyB === this.player.body && pair.bodyB.label === BODY_LABEL.GROUND)
      ) {
        this.player.setJumpCount(0);
      }
    }
  }

  private createGameObjects() {
    this.block = Bodies.rectangle(400, 500, 20, 20, { label: BODY_LABEL.BLOCK, isStatic: true });

    // this.ground = Bodies.rectangle(155, 600, 300, 30, { isStatic: true, label: BODY_LABEL.GROUND });
    this.ground = Bodies.rectangle(155, 600, 1000, 30, { isStatic: true, label: BODY_LABEL.GROUND });

    // トゲブロックの作成
    const spike = createSpikeBlock(600, 500, 40, 40);
    World.add(this.engine.world, [this.player.body, this.block, this.ground, spike]);
  }

  private updateView() {
    if (this.player.body.position.x > PLAYER_CENTER) {
      const offsetX = this.player.body.position.x - PLAYER_CENTER;
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

  private registerEvents() {
    window.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          this.player.moveLeft();
          break;
        case 'ArrowRight':
          this.player.moveRight();
          break;
        case ' ':
          this.player.jump();
          break;
        case 'r':
          this.resetGame();
          break;
      }
    });

    document.getElementById('restart-button')?.addEventListener('click', () => {
      this.resetGame();
    });
  }
}
