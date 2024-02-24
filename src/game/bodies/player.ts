import { Bodies, Body, Engine } from 'matter-js';
import { BODY_LABEL, MAX_JUMP_COUNT, PLAYER_CENTER } from '../const/game';

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

  constructor() {
    this.body = createPlayer(PLAYER_CENTER, 400, 40, 80);
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

  public resetJumpCount(event: Matter.IEventCollision<Engine>) {
    for (const pair of event.pairs) {
      if (
        (pair.bodyA === this.body && pair.bodyB.label === BODY_LABEL.BLOCK) ||
        (pair.bodyB === this.body && pair.bodyB.label === BODY_LABEL.BLOCK) ||
        (pair.bodyA === this.body && pair.bodyB.label === BODY_LABEL.GROUND) ||
        (pair.bodyB === this.body && pair.bodyB.label === BODY_LABEL.GROUND)
      ) {
        this.setJumpCount(0);
      }
    }
  }

  public jump(): void {
    if (this.jumpCount < MAX_JUMP_COUNT) {
      Body.applyForce(this.body, this.body.position, {
        x: 0,
        y: this.jumpCount === 0 ? -0.09 : -0.09,
      });
      this.jumpCount++;
    }
  }
}
