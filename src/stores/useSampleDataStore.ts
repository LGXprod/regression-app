import { create } from "zustand";
import { AxisBoundsType, Samples } from "../types";

type State = {
  sampleData: {
    trainSet: Samples;
    testSet: Samples;
    axisBounds: AxisBoundsType;
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
