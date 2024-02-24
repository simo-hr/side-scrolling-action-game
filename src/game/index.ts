import { Engine, Render, Bodies, World, Runner, Events } from 'matter-js';
import { BODY_LABEL, GAME_STATUS, PLAYER_CENTER, RENDER_HEIGHT, RENDER_WIDTH } from './const/game';

import { Player } from './bodies/player';
import { Stage } from './stage';

type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];

export class Game {
  private engine: Engine;
  private render: Render;
  private runner: Runner;
  private player: Player;
  private stage: Stage;
  private gameStatus: GameStatus = GAME_STATUS.READY;

  constructor() {
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

    this.player = new Player();
    this.stage = new Stage();
    this.createGameObjects();

    Events.on(this.engine, 'afterUpdate', () => {
      this.updateView();

      if (this.player.body.position.y > RENDER_HEIGHT) {
        this.gameOver();
      }
    });

    Events.on(this.engine, 'collisionStart', (event) => {
      this.player.resetJumpCount(event);
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

  private createGameObjects() {
    this.stage.draw(this.engine);
    World.add(this.engine.world, [this.player.body]);
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
      gameOverScreen.style.display = 'flex';
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
