export type FunctionType =
  | "linear"
  | "polynomial"
  | "discrete"
  | "piecewise"
  | "custom-upload";

export type ModelType = "linear-regression" | "polynomial-regression" | "cart";

export type Samples = { x: number; y: number }[];

export type AxisBoundsType = {
  mins: { x: number; y: number };
  maxs: { x: number; y: number };
};

export type RegressionOutput = {
  predictions: Samples;
  regressionEquation: string;
  axisBounds: AxisBoundsType;
  trainTime: number;
  inferenceTime: number;
  trainLoss: number | null;
  testLoss: {
    mae: number;
    mse: number;
    rmsle: number;
    r2score: number;
    ev: number;
  };
};

export type ProgLang = "Javascript" | "Golang" | "Rust";
