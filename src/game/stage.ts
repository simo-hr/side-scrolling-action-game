import { Bodies, Engine, World } from 'matter-js';
import { BODY_LABEL } from './const/game';
import { createSpikeBlock } from './bodies/spike';

export class Stage {
  constructor() {}

  public draw(engine: Engine) {
    const block = Bodies.rectangle(400, 500, 20, 20, { label: BODY_LABEL.BLOCK, isStatic: true });

    const ground = Bodies.rectangle(155, 600, 1000, 30, { isStatic: true, label: BODY_LABEL.GROUND });

    const spike = createSpikeBlock(600, 500, 40, 40);
    World.add(engine.world, [block, ground, spike]);
  }
}
