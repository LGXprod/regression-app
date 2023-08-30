import { getRandomFloat } from "../randomNumbers";
import YFunction from "./YFunction";

class LinearFunction implements YFunction {
  gradient: number;
  y_intercept: number;
  noise_range: number;

  constructor(gradient: number, y_intercept: number, noise_range: number = 0) {
    this.gradient = gradient;
    this.y_intercept = y_intercept;
    this.noise_range = noise_range;
  }

  calcY(x: number) {
    let y = this.gradient * x + this.y_intercept;

    if (this.noise_range !== 0) {
      y += getRandomFloat(-1 * this.noise_range, this.noise_range);
    }

    return y;
  }

  toString() {
    return `y = ${this.gradient}x + ${this.y_intercept} + rand(${-1 * this.noise_range}, ${this.noise_range})`;
  }
}

export default LinearFunction;