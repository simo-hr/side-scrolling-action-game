import { Bodies, Body } from 'matter-js';
import { MAX_JUMP_COUNT } from '../const/game';

export const createPlayer = (x: number, y: number, width: number, height: number): Body => {
  return Bodies.rectangle(x, y, width, height, {
    label: 'player',
    render: {
      sprite: {
        texture: '/images/player.png',
        xScale: 1,
        yScale: 1,
      },
    },
  });
};

export class Player {
  public body: Body;
  private jumpCount: number = MAX_JUMP_COUNT;

  constructor(x: number, y: number, width: number, height: number) {
    this.body = createPlayer(x, y, width, height);
  }

  public moveLeft(): void {
    Body.applyForce(this.body, this.body.position, { x: -0.03, y: 0 });
  }

  public moveRight(): void {
    Body.applyForce(this.body, this.body.position, { x: 0.03, y: 0 });
  }

  public setJumpCount(count: number): void {
    this.jumpCount = count;
  }

  public jump(): void {
    if (this.jumpCount < MAX_JUMP_COUNT) {
      console.log('Game  this.jumpCount:', this.jumpCount);
      Body.applyForce(this.body, this.body.position, {
        x: 0,
        y: this.jumpCount === 0 ? -0.09 : -0.09,
      });
      this.jumpCount++;
    }
  }
}
