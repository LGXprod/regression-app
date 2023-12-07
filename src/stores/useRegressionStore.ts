import { create } from "zustand";
import { RegressionOutput } from "../types";

type State = {
  regressionOutput: RegressionOutput | null;
};

type Action = {
  updateRegressionOutput: (regressionOutput: State["regressionOutput"]) => void;
};

const useRegressionOutputStore = create<State & Action>((set) => ({
  regressionOutput: null,
  updateRegressionOutput: (regressionOutput) =>
    set({ regressionOutput: regressionOutput }),
}));

export default useRegressionOutputStore;
