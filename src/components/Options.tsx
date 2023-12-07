import { FunctionType, ModelType } from "../types";
import useMenuOptionsStore from "../stores/useMenuOptionsStore";

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

  return (
    <div className="w-full flex items-center justify-center gap-4">
      <select
        className="border-2 rounded-md px-1 py-0.5 max-w-[150px]"
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          updateDataGeneratorType(e.target.value as FunctionType)
        }
      >
        <option value="linear">Linear Data</option>
        <option value="polynomial">Polynomial Data</option>
        <option value="discrete">Discrete Data</option>
        {/* <option value="piecewise">Piecewise Data</option>
        <option value="random">Random Data</option> */}
      </select>

      <select
        className="border-2 rounded-md px-1 py-0.5 max-w-[200px]"
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

      <button
        className="bg-indigo-500 hover:bg-indigo-400 text-slate-50 py-2 px-4 rounded-md"
        onClick={() => toggleRefresh()}
      >
        Refresh
      </button>
    </div>
  );
};

export default Options;
