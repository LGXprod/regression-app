import { AxisBoundsType, FunctionType, ModelType, Samples } from "../types";
import useMenuOptionsStore from "../stores/useMenuOptionsStore";
import useSampleDataStore from "../stores/useSampleDataStore";
import AxisBounds from "../helpers/AxisBounds";

function splitIntoTrainTest(
  customData: number[][],
  trainPercantage: number
): { trainSet: Samples; testSet: Samples; axisBounds: AxisBoundsType } {
  const trainSize = Math.floor((trainPercantage / 100) * customData.length);

  const axisBounds = new AxisBounds();

  const mapTrainSet = (row: number[]) => {
    const x = row[0];
    const y = row[1];

    axisBounds.addX(x);
    axisBounds.addY(y);

    return { x, y };
  };

  const trainSet = customData.slice(0, trainSize).map(mapTrainSet);
  const testSet = customData.slice(trainSize).map(mapTrainSet);

  trainSet.sort((a, b) => a.x - b.x);
  testSet.sort((a, b) => a.x - b.x);

  return { trainSet, testSet, axisBounds: axisBounds.axisBounds };
}

const csvFileToArray = (fileContent: string) => {
  fileContent = fileContent.trim();

  const array = fileContent.split("\n").map((row) => {
    const rowArray = row.split(",");
    const x = parseFloat(rowArray[0]);
    const y = parseFloat(rowArray[1]);

    return [x, y];
  });

  return array;
};

const Options = ({ toggleRefresh }: { toggleRefresh: () => void }) => {
  const dataGeneratorType = useMenuOptionsStore(
    (state) => state.dataGeneratorType
  );
  const modelType = useMenuOptionsStore((state) => state.modelType);
  const trainPercantage = useMenuOptionsStore((state) => state.trainPercentage);

  const updateDataGeneratorType = useMenuOptionsStore(
    (state) => state.updateDataGeneratorType
  );
  const updateModelType = useMenuOptionsStore((state) => state.updateModelType);
  const setPolyDegree = useMenuOptionsStore((state) => state.updatePolyDegree);
  const setTrainPercentage = useMenuOptionsStore(
    (state) => state.updateTrainPercentage
  );

  const updateSampleData = useSampleDataStore(
    (state) => state.updateSampleData
  );

  return (
    <div className="w-full flex items-center justify-center gap-4 max-md:flex-wrap">
      <select
        className="border-2 rounded-md px-1 py-0.5 min-w-[115px] max-w-[150px]"
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          updateDataGeneratorType(e.target.value as FunctionType)
        }
      >
        <option value="linear">Linear Data</option>
        <option value="polynomial">Polynomial Data</option>
        <option value="discrete">Discrete Data</option>
        <option value="custom-upload">Custom Upload</option>
        {/* <option value="piecewise">Piecewise Data</option>
        <option value="random">Random Data</option> */}
      </select>

      <select
        className="border-2 rounded-md px-1 py-0.5 min-w-[165px] max-w-[200px]"
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          updateModelType(e.target.value as ModelType)
        }
      >
        <option value="linear-regression">Linear Regression</option>
        <option value="polynomial-regression">Polynomial Regression</option>
        <option value="cart">CART Regression</option>
      </select>

      {modelType === "polynomial-regression" && (
        <>
          <label>Degree:</label>
          <input
            className="border-2 rounded-md max-w-[75px] px-1 py-0.5"
            type="number"
            defaultValue={2}
            min={2}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.value === "") return;
              setPolyDegree(parseInt(e.target.value));
            }}
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

      {dataGeneratorType === "custom-upload" && (
        <div className="max-w-[110px]">
          <input
            className="block w-full text-sm text-slate-50 file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0 text-transparent
            file:text-sm file:font-semibold
           file:bg-pink-500 file:text-slate-50
           hover:file:bg-pink-400 file:cursor-pointer cursor-pointer"
            type={"file"}
            accept={".csv"}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (!e.target.files) return;

              const file = e.target.files[0];
              const reader = new FileReader();

              reader.onload = (e) => {
                if (!e.target) return;

                const fileContent = e.target.result as string;
                const array = csvFileToArray(fileContent);

                const { trainSet, testSet, axisBounds } = splitIntoTrainTest(
                  array,
                  trainPercantage
                );

                updateSampleData({
                  trainSet,
                  testSet,
                  axisBounds,
                  dataGenerationEquation: "Custom CSV Upload",
                });
              };

              reader.readAsText(file);
            }}
          />
        </div>
      )}

      <button
        className="bg-indigo-500 hover:bg-indigo-400 text-slate-50 text-sm font-semibold py-2 px-4 rounded-md"
        onClick={() => toggleRefresh()}
      >
        Refresh
      </button>
    </div>
  );
};

export default Options;
