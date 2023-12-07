import CartRegressor from "../regressors/native/cartRegressor";
import linearRegressor from "../regressors/native/linearRegressor";
import PolynomialRegressor from "../regressors/native/polynomialRegressor";
import { ModelType, Samples } from "../types";

export default function getPredictions(
  trainSet: Samples,
  testSet: Samples,
  modelType: ModelType,
  polyDegree: number | null = null
) {
  if (modelType === "linear-regression") {
    const {
      predictions,
      regressionEquation,
      axisBounds,
      trainingTime,
      inferenceTime,
    } = linearRegressor(trainSet, testSet);

    return {
      predictions,
      regressionEquation,
      axisBounds,
      trainingTime,
      inferenceTime,
    };
  }

  if (modelType === "polynomial-regression" && polyDegree) {
    const polynomialRegressor = new PolynomialRegressor(
      trainSet,
      polyDegree,
      0.001,
      10000
    );

    const { equation, normMean, normStd, trainingTime } =
      polynomialRegressor.gdFit();

    const regressionEquation = `${equation} | Z(x) = (x - (${normMean})) / ${normStd}`;

    const {
      predictions,
      axisBounds,
      inferenceTime,
      // testLoss,
    } = polynomialRegressor.predictSamples(testSet);

    return {
      predictions,
      regressionEquation,
      axisBounds,
      trainingTime,
      inferenceTime,
    };
  }

  if (modelType === "cart") {
    try {
      const cartRegressor = new CartRegressor(trainSet, 50);
      const trainingTime = cartRegressor.build_tree();

      const {
        predictions,
        axisBounds,
        inferenceTime,
        // testLoss,
      } = cartRegressor.predictSamples(testSet);

      return {
        predictions,
        regressionEquation: "",
        axisBounds,
        trainingTime,
        inferenceTime,
      };
    } catch (e) {
      console.log("err:", e);
    }
  }

  return null;
}
