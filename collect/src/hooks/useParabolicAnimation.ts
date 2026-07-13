import { ref } from 'vue';

export interface ParabolicBall {
  show: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  pathX: number;
  pathY: number;
  progress: number;
}

export function useParabolicAnimation(ballCount = 5, duration = 400) {
  const balls = ref<ParabolicBall[]>([]);
  const totalCount = ref(0);

  for (let i = 0; i < ballCount; i++) {
    balls.value.push({
      show: false,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      pathX: 0,
      pathY: 0,
      progress: 0,
    });
  }

  function launch(startX: number, startY: number, endX: number, endY: number, pathY = 100) {
    const ball: any = balls.value.find((b) => !b.show);
    if (!ball) return;

    ball.startX = startX;
    ball.startY = startY;
    ball.endX = endX;
    ball.endY = endY;
    ball.pathX = 0;
    ball.pathY = pathY;
    ball.show = true;
    ball.progress = 0;

    const startTime = Date.now();

    function animate() {
      const elapsed = Date.now() - startTime;
      ball.progress = Math.min(elapsed / duration, 1);

      if (ball.progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          ball.show = false;
        }, 100);
      }
    }

    requestAnimationFrame(animate);
    totalCount.value++;
  }

  function reset() {
    balls.value.forEach((b) => {
      b.show = false;
    });
    totalCount.value = 0;
  }

  return {
    balls,
    totalCount,
    launch,
    reset,
  };
}
