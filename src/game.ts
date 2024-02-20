import { Engine, Render, Bodies, World, Body, Runner, Events } from 'matter-js';

export class Game {
  static RENDER_WIDTH = 1200;
  static RENDER_HEIGHT = 600;
  engine: Engine;
  render: Render;

  runner: Runner;

  constructor() {
    this.engine = Engine.create();
    this.render = Render.create({
      element: document.body,
      engine: this.engine,
      options: {
        width: Game.RENDER_WIDTH,
        height: Game.RENDER_HEIGHT,
        wireframes: false, // ワイヤーフレームの表示を無効化
        background: 'transparent', // 背景を透明に設定
        hasBounds: true, // ビューのスクロールを有効化
      },
    });

    this.runner = Runner.create();
    Runner.run(this.runner, this.engine);
    Render.run(this.render);
  }
}
