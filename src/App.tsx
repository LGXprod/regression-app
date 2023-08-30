import generateRandomSample from "./utils/sampleData/generateRandomSample";
import { AxisBounds, FunctionType, Samples } from "./types";
import { Chart } from "react-chartjs-2";
import linearRegressor from "./utils/regressors/native/linearRegressor";
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
  const [dataOption, setDataOption] = useState<FunctionType>("linear");
  const [polyDegree, setPolyDegree] = useState<number>(2);
  const [randomSample, setRandomSample] = useState<{
    samples: Samples;
    equation: string;
  }>();
  const [axisBounds, setAxisBounds] = useState<AxisBounds>();
  const [predictions, setPredictions] = useState<Samples>();

  useEffect(() => {
    const { axisBounds: sampleBounds, ...randomSample } = generateRandomSample(
      ...defaultRandomArgs
    );
    const { predictions, axisBounds: predictionBounds } = linearRegressor(
      randomSample.samples
    );

    setRandomSample(randomSample);
    setPredictions(predictions);
    setAxisBounds(getAxisBounds(sampleBounds, predictionBounds));
  }, []);

  useEffect(() => {
    switch (dataOption) {
      case "linear": {
        const { axisBounds: sampleBounds, ...randomSample } =
          generateRandomSample(...defaultRandomArgs);
        const { predictions, axisBounds: predictionBounds } = linearRegressor(
          randomSample.samples
        );

        setRandomSample(randomSample);
        setPredictions(predictions);
        setAxisBounds(getAxisBounds(sampleBounds, predictionBounds));
        break;
      }

      case "polynomial": {
        const { axisBounds: sampleBounds, ...randomSample } =
          generateRandomSample(...defaultRandomArgs, "polynomial", polyDegree);

        setRandomSample(randomSample);

        const polynomialRegressor = new PolynomialRegressor(
          randomSample.samples,
          polyDegree,
          0.001,
          10000
        );

        const { coefficients, loss } = polynomialRegressor.gdFit();
        console.log(coefficients, loss);

        const { predictions, axisBounds: predictionBounds } =
          polynomialRegressor.predictSamples();

        setPredictions(predictions);
        setAxisBounds(getAxisBounds(sampleBounds, predictionBounds));

        break;
      }
    }
  }, [dataOption, polyDegree]);

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

      <div className="flex items-center justify-center gap-4">
        <select
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
                    data: randomSample.samples,
                    backgroundColor: "#48BFE3",
                  },
                  {
                    label: "OLS Linear Regression",
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
    </div>
  );
}

export default App;
