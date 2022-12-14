const canvasBaseUtils = {
  /**
   * 绘制矩形
   */
  drawRectangular() {
    const canvas = document.getElementById('canvas-rectangular') as HTMLCanvasElement;
    if (canvas.getContext) {
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

      ctx.fillRect(85, 35, 120, 100);
      ctx.clearRect(105, 55, 80, 60);
      ctx.strokeRect(115, 60, 60, 50);
    }
  },

  /**
   * 绘制三角形
   */
  drawTriangle() {
    const canvas = document.getElementById('canvas-triangle') as HTMLCanvasElement;
    if (canvas && canvas?.getContext) {
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

      ctx.beginPath();
      ctx.moveTo(75, 50);
      ctx.lineTo(100, 75);
      ctx.lineTo(100, 25);
      ctx.fill();
    }
  },
};

export default canvasBaseUtils;
