import { create } from "zustand";
import { FunctionType, ModelType } from "../types";

type State = {
  dataGeneratorType: FunctionType;
  modelType: ModelType;
  polyDegree: number;
  trainPercentage: number;
};

type Action = {
  updateDataGeneratorType: (
    dataGeneratorType: State["dataGeneratorType"]
  ) => void;
  updateModelType: (modelType: State["modelType"]) => void;
  updatePolyDegree: (polyDegree: State["polyDegree"]) => void;
  updateTrainPercentage: (trainPercentage: State["trainPercentage"]) => void;
};

export const useMenuOptionsStore = create<State & Action>((set) => ({
  dataGeneratorType: "linear",
  modelType: "linear-regression",
  polyDegree: 2,
  trainPercentage: 70,
  updateDataGeneratorType: (dataGeneratorType) =>
    set(() => ({ dataGeneratorType: dataGeneratorType })),
  updateModelType: (modelType) => set(() => ({ modelType: modelType })),
  updatePolyDegree: (polyDegree) => set(() => ({ polyDegree: polyDegree })),
  updateTrainPercentage: (trainPercentage) =>
    set(() => ({ trainPercentage: trainPercentage })),
}));

export default useMenuOptionsStore;
