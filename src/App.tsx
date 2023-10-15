import generateRandomSample from "./utils/sampleData/generateRandomSample";
import { AxisBounds, FunctionType, ProgLang, Samples } from "./types";
import { Chart } from "react-chartjs-2";
import linearRegressor from "./utils/regressors/native/linearRegressor";
// import init, { linear_regressor as rustLinearRegressor } from "regressor-rs";
import { useEffect, useState } from "react";
import PolynomialRegressor from "./utils/regressors/native/polynomialRegressor";
import CartRegressor from "./utils/regressors/native/cartRegressor";

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

function getAxisBounds(
  sampleAxisBounds: AxisBounds,
  predictionsAxisBounds: AxisBounds
) {
  return {
    mins: {
      x: Math.min(sampleAxisBounds.mins.x, predictionsAxisBounds.mins.x),
      y: Math.min(sampleAxisBounds.mins.y, predictionsAxisBounds.mins.y),
    },
    maxs: {
      x: Math.max(sampleAxisBounds.maxs.x, predictionsAxisBounds.maxs.x),
      y: Math.max(sampleAxisBounds.maxs.y, predictionsAxisBounds.maxs.y),
    },
  };
}

function App() {
  // menu state
  const [dataOption, setDataOption] = useState<FunctionType>("linear");
  const [polyDegree, setPolyDegree] = useState<number>(2);
  const [progLang, setProgLang] = useState<ProgLang>("Javascript");

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
  const [trainPercantage, setTrainPercentage] = useState<number>(80);
  const [toggleRefresh, setToggleRefresh] = useState<boolean>(false);

  function updateLinearRegression() {
    const { axisBounds: sampleBounds, ...randomSample } = generateRandomSample(
      ...defaultRandomArgs,
      trainPercantage
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
    switch (dataOption) {
      case "linear": {
        updateLinearRegression();
        break;
      }

      case "polynomial": {
        const { axisBounds: sampleBounds, ...randomSample } =
          generateRandomSample(
            ...defaultRandomArgs,
            trainPercantage,
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
            trainPercantage,
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
  }, [toggleRefresh, dataOption, polyDegree, trainPercantage]);

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

      <div className="w-full flex items-center justify-center gap-4">
        <input
          type="radio"
          checked={progLang === "Javascript"}
          onChange={() => setProgLang("Javascript")}
        />
        <label>Javascript</label>
        <input
          type="radio"
          checked={progLang === "Golang"}
          onChange={() => setProgLang("Golang")}
        />
        <label>Golang</label>
        <input
          type="radio"
          checked={progLang === "Rust"}
          onChange={() => setProgLang("Rust")}
        />
        <label>Rust</label>

        <select
          className="border-2 rounded-md px-1 py-0.5 max-w-[150px]"
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setDataOption(e.target.value as FunctionType)
          }
        >
          <option value="linear">Linear Data</option>
          <option value="polynomial">Polynomial Data</option>
          <option value="discrete">Discrete Data</option>
          <option value="piecewise">Piecewise Data</option>
          <option value="random">Random Data</option>
        </select>

        {dataOption === "polynomial" && (
          <>
            <label>Degree:</label>
            <input
              className="border-2 rounded-md max-w-[75px] px-1 py-0.5"
              type="number"
              defaultValue={2}
              min={2}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPolyDegree(parseInt(e.target.value))
              }
            />
          </>
        )}

        <label>Train/Test Split:</label>

        <input
          className="w-[75px]"
          placeholder="Train"
          type="number"
          min={20}
          max={80}
          value={trainPercantage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTrainPercentage(parseInt(e.target.value))
          }
        />
        <label>/</label>
        <input
          className="w-[75px]"
          placeholder="Test"
          type="number"
          min={20}
          max={80}
          value={Math.abs(100 - trainPercantage)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTrainPercentage(Math.abs(100 - parseInt(e.target.value)))
          }
        />

        <button
          className="bg-indigo-500 hover:bg-indigo-400 text-slate-50 py-2 px-4 rounded-md"
          onClick={() => setToggleRefresh(!toggleRefresh)}
        >
          Refresh
        </button>
      </div>

      <div className="flex items-center justify-center gap-10 max-w-screen-2xl w-full h-full">
        <div className="bg-zinc-800 rounded-2xl p-8 drop-shadow-2xl max-w-5xl w-full h-full">
          <h2 className="text-4xl text-center mb-4">
            {((): string => {
              switch (dataOption) {
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
                        dataOption === "polynomial"
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
}

export default App;

// init().then(() => {
//   const rs_predictions = rustLinearRegressor(
//     new Float64Array(randomSample.trainingSet.map(({ x }) => x)),
//     new Float64Array(randomSample.trainingSet.map(({ y }) => y))
//   );

//   // console.log(
//   //   "rust",
//   //   rs_predictions.get_predictions()
//   // );

//   const preds = rs_predictions.get_predictions();
//   const prediction_samples: Samples = [];

//   preds.forEach((y, i) => {
//     prediction_samples.push({
//       x: randomSample.testSet[i].x,
//       y,
//     });
//   });

//   setPredictions(prediction_samples);
// });
