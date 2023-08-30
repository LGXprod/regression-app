import { FunctionType, Samples } from "../../types";
import AxisBounds from "../chartConfig/AxisBounds";
import { getRandomFloat, getRandomInteger } from "./randomNumbers";
import LinearFunction from "./yFunctions/LinearFunction";
import PolynomialFunction from "./yFunctions/PolynomialFunction";

function generateRandomSample(
  min_val: number,
  max_val: number,
  num_samples: number,
  function_type: FunctionType = "linear",
  degree: number = 2
) {
  let yFunc: LinearFunction | PolynomialFunction;

  switch (function_type) {
    case "linear":
      yFunc = new LinearFunction(
        getRandomFloat(-10, 10),
        getRandomInteger(-5, 5),
        50
      );
      break;
    case "polynomial":
      yFunc = new PolynomialFunction(degree, 200);
      break;
    default:
      yFunc = new LinearFunction(
        getRandomFloat(-10, 10),
        getRandomInteger(-5, 5),
        50
      );
      break;
  }

  const samples: Samples = [];

  const axisBounds = new AxisBounds();

  for (let i = 1; i <= num_samples; i++) {
    const x = getRandomInteger(min_val, max_val) + getRandomFloat(0, 3);
    const y = yFunc.calcY(x);

    axisBounds.addX(x);
    axisBounds.addY(y);

    samples.push({
      x,
      y,
    });
  }

  samples.sort((a, b) => a.x - b.x);

  return {
    samples,
    equation: yFunc.toString(),
    axisBounds: axisBounds.axisBounds,
  };
}

export default generateRandomSample;
