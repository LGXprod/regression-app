import { Samples } from "../../../types";
import AxisBounds from "../../chartConfig/AxisBounds";
import Loss from "./loss";

function linearRegressor(trainSet: Samples, testSet: Samples) {
  const start_training_time = performance.now();

  // calculate mean of x and y
  let x_mean = 0;
  let y_mean = 0;

  for (const { x, y } of trainSet) {
    x_mean += x;
    y_mean += y;
  }

  x_mean = x_mean / trainSet.length;
  y_mean = y_mean / trainSet.length;

  // calculate m (gradient)
  let x_y_mean_diff_product = 0;
  let x_mean_diff_squared = 0;

  for (const { x, y } of trainSet) {
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

  const inference_time = performance.now();

  const loss = new Loss();

  for (const { x, y } of testSet) {
    const pred_y = calcY(x);
    loss.addResidual(y, pred_y);

    axisBounds.addX(x);
    axisBounds.addY(pred_y);

    predictions.push({ x, y: pred_y });
  }

  return {
    predictions,
    testLoss: loss.getLossMetrics(),
    axisBounds: axisBounds.axisBounds,
    trainingTime: +(performance.now() - start_training_time).toFixed(2),
    inferenceTime: +(performance.now() - inference_time).toFixed(2),
  };
}

export default linearRegressor;
