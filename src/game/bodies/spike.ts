import { Bodies, Body } from 'matter-js';
import { BODY_LABEL } from '../const/game';

export const createSpikeBlock = (x: number, y: number, width: number, height: number): Body => {
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
};
