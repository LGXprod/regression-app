import { useEffect, useState } from "react";

import { Chart } from "react-chartjs-2";

import { AxisBounds, Samples } from "./types";

import { getAxisBounds } from "./helpers/AxisBounds";

import Options from "./components/Options";

import generateRandomSample from "./data-generators/generateRandomSample";

import linearRegressor from "./regressors/native/linearRegressor";
import PolynomialRegressor from "./regressors/native/polynomialRegressor";
import CartRegressor from "./regressors/native/cartRegressor";
import useMenuOptionsStore from "./stores/useMenuOptionsStore";

const defaultRandomArgs: [number, number, number] = [-100, 100, 500];

const chartScaleOptions = {
  grid: {
    display: false,
  },
  border: {
    display: false,
  },
  ticks: {
    color: "#EEEEEE",
  },
};

const App = () => {
  const { dataGeneratorType, modelType, polyDegree, trainPercentage } =
    useMenuOptionsStore((state) => ({
      dataGeneratorType: state.dataGeneratorType,
      modelType: state.modelType,
      polyDegree: state.polyDegree,
      trainPercentage: state.trainPercentage,
    }));
  const [toggleRefresh, setToggleRefresh] = useState<boolean>(false);

  // chart state
  const [randomSample, setRandomSample] = useState<{
    trainingSet: Samples;
    testSet: Samples;
    equation: string;
  }>();
  const [axisBounds, setAxisBounds] = useState<AxisBounds>();
  const [executionTime, setExecutionTime] = useState<{
    trainingTime: number;
    inferenceTime: number;
  }>();
  const [regressionEquation, setRegressionEquation] = useState<string>();
  const [norm, setNorm] = useState<{ mean: number; std: number } | null>();
  const [predictions, setPredictions] = useState<Samples>();
  const [testLossMetrics, setTestLossMetrics] = useState<{
    mae: number;
    mse: number;
    rmsle: number;
    r2score: number;
    ev: number;
  }>();
  const [trainLoss, setTrainLoss] = useState<number | null>();

  function updateLinearRegression() {
    const { axisBounds: sampleBounds, ...randomSample } = generateRandomSample(
      ...defaultRandomArgs,
      trainPercentage
    );
    const {
      predictions,
      regressionEquation,
      axisBounds: predictionBounds,
      trainingTime,
      inferenceTime,
      testLoss,
    } = linearRegressor(randomSample.trainingSet, randomSample.testSet);

    setRandomSample(randomSample);
    setExecutionTime({ trainingTime, inferenceTime });
    setRegressionEquation(regressionEquation);
    setNorm(null);
    setPredictions(predictions);
    setTrainLoss(null);
    setTestLossMetrics(testLoss);
    setAxisBounds(getAxisBounds(sampleBounds, predictionBounds));
  }

  useEffect(() => updateLinearRegression, []);

  useEffect(() => {
    switch (dataGeneratorType) {
      case "linear": {
        updateLinearRegression();
        break;
      }

      case "polynomial": {
        const { axisBounds: sampleBounds, ...randomSample } =
          generateRandomSample(
            ...defaultRandomArgs,
            trainPercentage,
            "polynomial",
            polyDegree
          );

        setRandomSample(randomSample);

        const polynomialRegressor = new PolynomialRegressor(
          randomSample.trainingSet,
          polyDegree,
          0.001,
          10000
        );

        const { equation, normMean, normStd, loss, trainingTime } =
          polynomialRegressor.gdFit();

        setRegressionEquation(equation);
        setNorm({ mean: normMean, std: normStd });
        setTrainLoss(Math.round(loss * 100) / 100);

        const {
          predictions,
          axisBounds: predictionBounds,
          inferenceTime,
          testLoss,
        } = polynomialRegressor.predictSamples(randomSample.testSet);

        setExecutionTime({ trainingTime, inferenceTime });
        setPredictions(predictions);
        setTestLossMetrics(testLoss);
        setAxisBounds(getAxisBounds(sampleBounds, predictionBounds));

        break;
      }

      case "discrete": {
        const { axisBounds: sampleBounds, ...randomSample } =
          generateRandomSample(
            ...defaultRandomArgs,
            trainPercentage,
            "discrete"
          );
        setRandomSample(randomSample);

        const axisBounds = sampleBounds;
        axisBounds.mins.y = -0.5;
        axisBounds.maxs.y = 1.5;
        setAxisBounds(axisBounds);

        try {
          const cartRegressor = new CartRegressor(randomSample.trainingSet, 50);
          const trainingTime = cartRegressor.build_tree();

          setRegressionEquation("Discrete");
          setNorm(null);
          setTrainLoss(null);

          const {
            predictions,
            axisBounds: predictionBounds,
            inferenceTime,
            testLoss,
          } = cartRegressor.predictSamples(randomSample.testSet);

          setExecutionTime({ trainingTime, inferenceTime });
          setPredictions(predictions);
          setTestLossMetrics(testLoss);
        } catch (e) {
          console.log("err:", e);
        }

        break;
      }
    }
  }, [toggleRefresh, dataGeneratorType, polyDegree, trainPercentage]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8 mx-auto">
      <h1 className="text-6xl">Regression ML 📈</h1>
      <p className="text-center max-w-7xl">
        Are you struggling to make sense of your data? Look no further than
        Regression ML! Our advanced algorithms make it simple to model your data
        and see the patterns that matter most. With Regression ML, you'll never
        have to guess again. Try it out today and see the difference for
        yourself!
      </p>

      <Options toggleRefresh={() => setToggleRefresh(!toggleRefresh)} />

      <div className="flex items-center justify-center gap-10 max-w-screen-2xl w-full h-full">
        <div className="bg-zinc-800 rounded-2xl p-8 drop-shadow-2xl max-w-5xl w-full h-full">
          <h2 className="text-4xl text-center mb-4">
            {((): string => {
              switch (dataGeneratorType) {
                case "linear": {
                  return `Linear Regression`;
                }

                case "polynomial": {
                  return `Polynomial Data (Degree ${polyDegree})`;
                }

                case "discrete": {
                  return "Discrete Data";
                }

                case "piecewise": {
                  return "Piecewise Data";
                }

                case "random": {
                  return "Random Data";
                }
              }
            })()}
          </h2>

          <h3 className="text-center text-xl">
            {`${regressionEquation}`}
            {norm && ` | Z(x) = (x - (${norm.mean})) / ${norm.std}`}
          </h3>

          {randomSample && axisBounds && predictions && (
            <>
              <Chart
                type="scatter"
                options={{
                  scales: {
                    x: {
                      min: axisBounds.mins.x,
                      max: axisBounds.maxs.x,
                      title: {
                        text: "X Samples",
                        display: true,
                        color: "#EEEEEE",
                      },
                      ...chartScaleOptions,
                    },
                    y: {
                      min: axisBounds.mins.y,
                      max: axisBounds.maxs.y,
                      title: {
                        text: "Y = F(X)",
                        display: true,
                        color: "#EEEEEE",
                      },
                      ...chartScaleOptions,
                    },
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: "#EEEEEE",
                      },
                    },
                  },
                }}
                data={{
                  datasets: [
                    {
                      label: "Random Samples",
                      data: randomSample.testSet,
                      backgroundColor: "#48BFE3",
                    },
                    {
                      label:
                        dataGeneratorType === "polynomial"
                          ? "Polynomial Regression"
                          : "Linear Regression",
                      data: predictions,
                      backgroundColor: "#F72585",
                      tension: 0.4,
                      borderColor: "#F72585",
                      borderWidth: 4,
                      type: "line" as const,
                      pointRadius: 0,
                    },
                  ],
                }}
              />

              <h3 className="text-xl text-center mt-4">
                Data modelled using: {randomSample.equation}
              </h3>
            </>
          )}
        </div>

        <div className="bg-zinc-800 rounded-2xl p-8 drop-shadow-2xl">
          <h2 className="text-4xl text-center mb-4">Regression Metrics</h2>

          <h3 className="text-xl mt-4 mb-2">Training Metrics</h3>

          <div className="grid grid-cols-2 gap-x-4">
            <p>MSE Loss: {trainLoss ? trainLoss : "NA"}</p>

            {executionTime && (
              <p>
                Execution Time:{" "}
                {executionTime.trainingTime > 0.01
                  ? executionTime.trainingTime
                  : "≤ 0.01"}{" "}
                ms
              </p>
            )}
          </div>

          <hr className="mt-4" />

          <h3 className="text-xl mt-4 mb-2">Testing Metrics</h3>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <p>MAE Loss: {testLossMetrics && testLossMetrics.mae}</p>
            <p>
              R<sup>2</sup> Score: {testLossMetrics && testLossMetrics.r2score}
            </p>

            <p>MSE Loss: {testLossMetrics && testLossMetrics.mse}</p>
            <p>RMSLE Loss: {testLossMetrics && testLossMetrics.rmsle}</p>

            <p>EV: {testLossMetrics && testLossMetrics.ev}</p>
            {executionTime && (
              <p>
                Execution Time:{" "}
                {executionTime.inferenceTime > 0.01
                  ? executionTime.inferenceTime
                  : "≤ 0.01"}{" "}
                ms
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
