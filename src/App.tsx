import generateRandomSample from "./utils/sampleData/generateRandomSample";
import { AxisBounds, FunctionType, Samples } from "./types";
import { Chart } from "react-chartjs-2";
import linearRegressor from "./utils/regressors/native/linearRegressor";
import init, { linear_regressor as rustLinearRegressor } from "regressor-rs";
import { useEffect, useState } from "react";
import PolynomialRegressor from "./utils/regressors/native/polynomialRegressor";

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
  const [isJavascript, setIsJavascript] = useState<boolean>(true);

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
  const [predictions, setPredictions] = useState<Samples>();
  const [trainPercantage, setTrainPercentage] = useState<number>(80);

  useEffect(() => {
    const { axisBounds: sampleBounds, ...randomSample } = generateRandomSample(
      ...defaultRandomArgs,
      trainPercantage
    );
    const {
      predictions,
      axisBounds: predictionBounds,
      trainingTime,
      inferenceTime,
    } = linearRegressor(randomSample.trainingSet);

    init().then(() => {
      const rs_predictions = rustLinearRegressor(
        new Float64Array(randomSample.trainingSet.map(({ x }) => x)),
        new Float64Array(randomSample.trainingSet.map(({ y }) => y))
      );

      // console.log(
      //   "rust",
      //   rs_predictions.get_predictions()
      // );

      const preds = rs_predictions.get_predictions();
      const prediction_samples: Samples = [];

      preds.forEach((y, i) => {
        prediction_samples.push({
          x: randomSample.testSet[i].x,
          y,
        });
      });

      setPredictions(prediction_samples);
    });

    setRandomSample(randomSample);
    setExecutionTime({ trainingTime, inferenceTime });
    // setPredictions(predictions);
    setAxisBounds(getAxisBounds(sampleBounds, predictionBounds));
  }, []);

  useEffect(() => {
    switch (dataOption) {
      case "linear": {
        const { axisBounds: sampleBounds, ...randomSample } =
          generateRandomSample(...defaultRandomArgs, trainPercantage);
        const {
          predictions,
          axisBounds: predictionBounds,
          trainingTime,
          inferenceTime,
        } = linearRegressor(randomSample.trainingSet);

        setRandomSample(randomSample);
        setExecutionTime({ trainingTime, inferenceTime });
        setPredictions(predictions);

        setAxisBounds(getAxisBounds(sampleBounds, predictionBounds));
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

        const { coefficients, loss, trainingTime } =
          polynomialRegressor.gdFit();
        console.log(coefficients, loss);

        const {
          predictions,
          axisBounds: predictionBounds,
          inferenceTime,
        } = polynomialRegressor.predictSamples();

        setExecutionTime({ trainingTime, inferenceTime });
        setPredictions(predictions);
        setAxisBounds(getAxisBounds(sampleBounds, predictionBounds));

        break;
      }
    }
  }, [dataOption, polyDegree, trainPercantage]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8 mx-auto max-w-7xl">
      <h1 className="text-6xl">Regressor.io</h1>
      <p className="text-center">
        Are you struggling to make sense of your data? Look no further than
        regressor.io! Our advanced algorithms make it simple to model your data
        and see the patterns that matter most. With regressor.io, you'll never
        have to guess again. Try it out today and see the difference for
        yourself!
      </p>

      <div className="w-full flex items-center justify-center gap-4">
        <input
          type="radio"
          checked={isJavascript}
          onChange={() => setIsJavascript(true)}
        />
        <label>Javascript</label>
        <input
          type="radio"
          checked={!isJavascript}
          onChange={() => setIsJavascript(!true)}
        />
        <label>Golang</label>
        <input
          type="radio"
          checked={!isJavascript}
          onChange={() => setIsJavascript(!true)}
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
          <option value="non-linear">Non-linear Data</option>
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
      </div>

      <div className="chart-container w-full h-full">
        <h2 className="text-4xl text-center mb-4">
          {((): string => {
            switch (dataOption) {
              case "linear": {
                return "Linear Data";
              }

              case "polynomial": {
                return `Polynomial Data (Degree ${polyDegree})`;
              }

              case "non-linear": {
                return "Non-linear Data";
              }

              case "random": {
                return "Random Data";
              }
            }
          })()}
        </h2>

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

            {executionTime && (
              <>
                <h4 className="text-base text-center mt-4">
                  Training Time:{" "}
                  {executionTime.trainingTime > 0.01
                    ? executionTime.trainingTime
                    : "Less than 0.01"}{" "}
                  Milliseconds
                </h4>

                <h4 className="text-base text-center mt-4">
                  Inference Time:{" "}
                  {executionTime.inferenceTime > 0.01
                    ? executionTime.inferenceTime
                    : "Less than 0.01"}{" "}
                  Milliseconds
                </h4>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
