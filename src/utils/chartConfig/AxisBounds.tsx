class AxisBounds {
  mins: { x: number; y: number };
  maxs: { x: number; y: number };

  constructor () {
    this.mins = { x: Infinity, y: Infinity };
    this.maxs = { x: -Infinity, y: -Infinity };
  }

  roundTo5(roundingFunc: (x: number) => number, num: number) {
    return roundingFunc(num / 5) * 5;
  }

  addX(x: number) {
    this.mins.x = this.roundTo5(Math.floor, Math.min(this.mins.x, x));
    this.maxs.x = this.roundTo5(Math.ceil, Math.max(this.maxs.x, x));
  }

  addY(y: number) {
    this.mins.y = this.roundTo5(Math.floor, Math.min(this.mins.y, y));
    this.maxs.y = this.roundTo5(Math.ceil, Math.max(this.maxs.y, y));
  }

  get axisBounds() {
    return { mins: this.mins, maxs: this.maxs };
  }
}

export default AxisBounds;