class Loss {
  residuals: number[];
  actual_ys: number[];

  constructor() {
    this.residuals = [];
    this.actual_ys = [];
  }

  addResidual(y: number, y_pred: number) {
    this.residuals.push(y - y_pred);
    this.actual_ys.push(y);
  }

  calcMae() {
    return (
      this.residuals.reduce((a, b) => a + Math.abs(b), 0) /
      this.residuals.length
    );
  }

  calcMse() {
    return (
      this.residuals.reduce((a, b) => a + b * b, 0) / this.residuals.length
    );
  }

  calcRmsle() {
    return Math.log(Math.sqrt(this.calcMse()));
  }

  calcMean(nums: number[]) {
    return nums.reduce((a, b) => a + b, 0) / this.actual_ys.length;
  }

  calcR2score() {
    const y_mean = this.calcMean(this.actual_ys);

    const rss = this.residuals.reduce((a, b) => a + b * b, 0);
    const tss = this.actual_ys.reduce((a, b) => a + Math.pow(b - y_mean, 2), 0);

    return 1 - rss / tss;
  }

  calcVariance(nums: number[]) {
    const mean = this.calcMean(nums);

    return nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length;
  }

  calcEv() {
    return (
      1 - this.calcVariance(this.residuals) / this.calcVariance(this.actual_ys)
    );
  }

  getLossMetrics() {
    return {
      mae: Math.round(this.calcMae() * 100) / 100,
      mse: Math.round(this.calcMse() * 100) / 100,
      rmsle: Math.round(this.calcRmsle() * 100) / 100,
      r2score: Math.round(this.calcR2score() * 100) / 100,
      ev: Math.round(this.calcEv() * 100) / 100,
    };
  }
}

export default Loss;
