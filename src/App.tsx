import { useEffect, useState } from "react";

import { Chart } from "react-chartjs-2";

import Options from "./components/Options";

import generateRandomSample from "./data-generators/generateRandomSample";

import { getAxisBounds } from "./helpers/AxisBounds";

import { AxisBounds, Samples } from "./types";

import useMenuOptionsStore from "./stores/useMenuOptionsStore";
import useSampleDataStore from "./stores/useSampleDataStore";
import getPredictions from "./helpers/getPredictions";
import useRegressionOutputStore from "./stores/useRegressionStore";
import RegressionChart from "./components/RegressionChart";

const App = () => {
  const { dataGeneratorType, polyDegree, modelType, trainPercentage } =
    useMenuOptionsStore((state) => ({
      dataGeneratorType: state.dataGeneratorType,
      modelType: state.modelType,
      polyDegree: state.polyDegree,
      trainPercentage: state.trainPercentage,
    }));
  const { dataGenerationEquation } = useSampleDataStore((state) => ({
    dataGenerationEquation: state.sampleData?.dataGenerationEquation,
  }));
  const { regressionEquation } = useRegressionOutputStore((state) => ({
    regressionEquation: state.regressionOutput?.regressionEquation,
  }));

  const updateSampleData = useSampleDataStore(
    (state) => state.updateSampleData
  );
  const updateRegressionOutput = useRegressionOutputStore(
    (state) => state.updateRegressionOutput
  );

  const [toggleRefresh, setToggleRefresh] = useState<boolean>(false);

  useEffect(() => {
    const sampleData = generateRandomSample(
      trainPercentage,
      dataGeneratorType,
      polyDegree
    );

    updateSampleData(sampleData);

    const { trainSet, testSet } = sampleData;

    const regressionOutput = getPredictions(
      trainSet,
      testSet,
      modelType,
      polyDegree
    );

    updateRegressionOutput(regressionOutput);
  }, [
    toggleRefresh,
    dataGeneratorType,
    polyDegree,
    modelType,
    trainPercentage,
  ]);

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
              switch (modelType) {
                case "linear-regression": {
                  return `Linear Regression`;
                }

                case "polynomial-regression": {
                  return `Polynomial Regression (Degree: ${polyDegree})`;
                }

                case "cart": {
                  return "CART Regression";
                }
              }
            })()}
          </h2>

          <h3 className="text-center text-xl">{regressionEquation}</h3>

          <RegressionChart />

          <h3 className="text-xl text-center mt-4">
            Data modelled using: {dataGenerationEquation}
          </h3>
        </div>

        {/* <div className="bg-zinc-800 rounded-2xl p-8 drop-shadow-2xl">
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
        </div> */}
      </div>
    </div>
  );
};

export default App;
