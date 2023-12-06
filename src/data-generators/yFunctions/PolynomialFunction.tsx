import { getRandomFloat } from "../../helpers/randomNumbers";
import YFunction from "./YFunction";

class PolynomialFunction implements YFunction {
  coefficients: number[] = [];
  noise_range: number;

  constructor(degree: number = 2, noise_range: number = 0) {
    this.noise_range = Math.pow(noise_range, degree - 1);

    for (let i = 1; i <= degree + 1; i++) {
      this.coefficients.push(getRandomFloat(-3, 3));
    }
  }

  calcY(x: number) {
    let y = 0;

    for (const i in this.coefficients) {
      const coefficient = this.coefficients[i];

      if (this.noise_range !== 0) {
        y +=
          coefficient * Math.pow(x, parseInt(i)) +
          getRandomFloat(-1 * this.noise_range, this.noise_range);
      }
    }

    return y;
  }

  toString() {
    let equation = "";

    function getCoefficient(coefficient: number) {
      return coefficient >= 0
        ? `+ ${coefficient}`
        : `- ${Math.abs(coefficient)}`;
    }

    equation = `${equation} ${getCoefficient(this.coefficients[0])}`;

    for (const [i, coefficient] of this.coefficients.slice(1, -1).entries()) {
      let x_degree = "x";

      if (i > 0) {
        x_degree += `^${i + 1}`;
      }

      equation = `${getCoefficient(coefficient)}${x_degree} ${equation}`;
    }

    equation = `y = ${this.coefficients.slice(-1)[0]}x^${
      this.coefficients.length - 1
    } ${equation} + rand(${-1 * this.noise_range}, ${this.noise_range})`;

    return equation;
  }
}

export default PolynomialFunction;
