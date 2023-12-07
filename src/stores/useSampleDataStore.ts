import { create } from "zustand";
import { AxisBounds, Samples } from "../types";

type State = {
  sampleData: {
    trainSet: Samples;
    testSet: Samples;
    axisBounds: AxisBounds;
    dataGenerationEquation: string;
  } | null;
};

type Action = {
  updateSampleData: (sampleData: State["sampleData"]) => void;
};

const useSampleDataStore = create<State & Action>((set) => ({
  sampleData: null,
  updateSampleData: (sampleData) =>
    set(() => ({
      sampleData: sampleData,
    })),
}));

export default useSampleDataStore;
