import { Samples } from "../../../types";
import AxisBounds from "../../chartConfig/AxisBounds";

function linearRegressor(samples: Samples) {
  // calculate mean of x and y
  let x_mean = 0;
  let y_mean = 0;

  for (const { x, y } of samples) {
    x_mean += x;
    y_mean += y;
  }

  x_mean = x_mean / samples.length;
  y_mean = y_mean / samples.length;

  // calculate m (gradient)
  let x_y_mean_diff_product = 0;
  let x_mean_diff_squared = 0;

  for (const { x, y } of samples) {
    const x_mean_diff = x - x_mean;

    x_y_mean_diff_product += x_mean_diff * (y - y_mean);
    x_mean_diff_squared += x_mean_diff * x_mean_diff;
  }

  const m = x_y_mean_diff_product / x_mean_diff_squared;

  // calculate b (y-intercept)
  const b = y_mean - m * x_mean;

  const predictions: Samples = [];

  function calcY(x: number) {
    return m * x + b;
  }

  const axisBounds = new AxisBounds();

  for (const { x } of samples) {
    const y = calcY(x);

    axisBounds.addX(x);
    axisBounds.addY(y);

    predictions.push({ x, y });
  }

  return { predictions, axisBounds: axisBounds.axisBounds };
}

export default linearRegressor;
