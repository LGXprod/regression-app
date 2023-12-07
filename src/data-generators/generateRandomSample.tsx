import { FunctionType, Samples } from "../types";
import AxisBounds from "../helpers/AxisBounds";
import { getRandomFloat, getRandomInteger } from "../helpers/randomNumbers";
import DiscreteFunction from "./yFunctions/DiscreteFunction";
import LinearFunction from "./yFunctions/LinearFunction";
import PolynomialFunction from "./yFunctions/PolynomialFunction";

const [min_val, max_val, num_samples] = [-100, 100, 500];

function generateRandomSample(
  trainingPercentage: number,
  function_type: FunctionType = "linear",
  degree: number = 2
) {
  let yFunc: LinearFunction | PolynomialFunction | DiscreteFunction;

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
    case "discrete":
      yFunc = new DiscreteFunction(5, min_val, max_val);
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

  const testSet = [];
  const testPercentage = Math.abs(100 - trainingPercentage);
  let testSetSize = Math.floor((testPercentage / 100) * num_samples);

  while (testSetSize > 0) {
    const randomIndex = getRandomInteger(0, samples.length - 1);
    const randomSample = samples.splice(randomIndex, 1)[0];
    testSet.push(randomSample);
    testSetSize--;
  }

  testSet.sort((a, b) => a.x - b.x);

  return {
    trainSet: samples,
    testSet,
    dataGenerationEquation: yFunc.toString(),
    axisBounds: axisBounds.axisBounds,
  };
}

export default generateRandomSample;
