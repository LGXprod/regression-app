import { Samples } from "../../../types";
import AxisBounds from "../../chartConfig/AxisBounds";
import Loss from "./loss";

class PolynomialRegressor {
  degree: number;
  learning_rate: number;
  max_iterations: number;
  x_train: number[];
  x_norm_to_x: { [key: number]: number };
  y_train: number[];
  coefficients: number[];
  loss: number;
  x_mean: number;
  x_std: number;

  constructor(
    samples: Samples,
    degree: number,
    learning_rate: number,
    max_iterations: number
  ) {
    this.degree = degree;
    this.learning_rate = learning_rate;
    this.max_iterations = max_iterations;
    this.coefficients = [];
    this.loss = 0;

    const x_samples = [];
    const x_norm_to_x: { [key: number]: number } = {};
    const y_train = [];

    for (const { x, y } of samples) {
      x_samples.push(x);
      y_train.push(y);
    }

    this.x_mean = x_samples.reduce((a, b) => a + b) / x_samples.length;
    this.x_std = Math.sqrt(
      x_samples
        .map((x) => Math.pow(x - this.x_mean, 2))
        .reduce((a, b) => a + b) / x_samples.length
    ); // x standard deviation

    for (const x_index in x_samples) {
      const x = x_samples[x_index];
      const x_norm = this.normalize(x);

      x_samples[x_index] = x_norm;
      x_norm_to_x[x_norm] = x;
    }

    this.x_train = x_samples;
    this.x_norm_to_x = x_norm_to_x;
    this.y_train = y_train;
  }

  normalize(x: number) {
    return (x - this.x_mean) / this.x_std;
  }

  calcY(coefficients: number[], x: number) {
    let y = coefficients[0];

    for (let i = 1; i <= this.degree; i++)
      y += coefficients[i] * Math.pow(x, i);

    return y;
  }

  calcLoss(y_samples: number[], pred_y: number[]) {
    let err_diff = 0;

    for (const i in y_samples) {
      err_diff += Math.pow(y_samples[i] - pred_y[i], 2);
    }

    return err_diff / y_samples.length;
  }

  calcGradientSums(coefficients: number[]) {
    // initialize gradient_sums array
    const gradient_sums: number[] = [];
    for (let i = 1; i <= this.degree + 1; i++) gradient_sums.push(0);

    const y_predictions = [];

    for (const i in this.x_train) {
      const x = this.x_train[i];
      const y = this.y_train[i];
      const y_pred = this.calcY(coefficients, x);

      // if (i == "1") {
      //   console.log(x, y, y_pred);
      // }

      y_predictions.push(y_pred);

      gradient_sums[0] += y - y_pred; // updating gradient sum for w0

      for (let w_index = 1; w_index < gradient_sums.length; w_index++) {
        // updating gradient sum for w1, w2, ..., wn
        gradient_sums[w_index] += Math.pow(x, w_index) * (y - y_pred);
      }
    }

    return { gradient_sums, y_predictions };
  }

  calcGradientFunc(coefficients: number[]) {
    // returns coefficients of the gradient function of the lost function
    // with respect to the coefficients (w0, w1, w2, ...)
    // x_train.length === y_train.length
    // gradients.length === coefficients.length === degree + 1
    const { gradient_sums, y_predictions } =
      this.calcGradientSums(coefficients);

    for (const i in gradient_sums) {
      const gradient = (-2 / this.x_train.length) * gradient_sums[i];

      gradient_sums[i] = coefficients[i] - this.learning_rate * gradient;
    }

    const loss = this.calcLoss(this.y_train, y_predictions);

    return { updated_coefficients: gradient_sums, loss };
  }

  gdFit() {
    const training_start_time = performance.now();

    const rand_coefficients = [];
    for (let i = 1; i <= this.degree + 1; i++) rand_coefficients.push(1);

    let min_loss = Infinity;
    let min_loss_coefficients: number[] = [];
    // let min_loss_interation: number = 0;

    let current_coefficients: number[] = rand_coefficients;

    for (let i = 1; i <= this.max_iterations; i++) {
      const { updated_coefficients, loss } =
        this.calcGradientFunc(current_coefficients);

      current_coefficients = updated_coefficients;

      // console.log("Iteration:", i, updated_coefficients, loss);

      if (loss < min_loss) {
        min_loss = loss;
        min_loss_coefficients = updated_coefficients;
        // min_loss_interation = i;
      }
    }

    // console.log("min_loss_interation", min_loss_interation);

    this.coefficients = min_loss_coefficients;
    this.loss = min_loss;

    return {
      coefficients: min_loss_coefficients,
      loss: min_loss,
      trainingTime: +(performance.now() - training_start_time).toFixed(2),
    };
  }

  predictSamples(testSet: Samples) {
    const inferenceTime = performance.now();

    const predictions: Samples = [];
    const axisBounds = new AxisBounds();

    const loss = new Loss();

    for (const { x, y } of testSet) {
      const x_norm = this.normalize(x);
      const y_pred = this.calcY(this.coefficients, x_norm);

      loss.addResidual(y, y_pred);

      axisBounds.addX(x);
      axisBounds.addY(y_pred);

      predictions.push({ x, y: y_pred });
    }

    return {
      predictions,
      testLoss: loss.getLossMetrics(),
      axisBounds: axisBounds.axisBounds,
      inferenceTime: +(performance.now() - inferenceTime).toFixed(2),
    };
  }
}

export default PolynomialRegressor;
