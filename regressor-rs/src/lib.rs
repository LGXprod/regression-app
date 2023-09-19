// lib.rs
extern crate console_error_panic_hook;
use std::iter::zip;
// use std::time::Instant;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Debug)]
pub struct Sample {
    x: f64,
    y: f64,
}

#[wasm_bindgen]
pub struct SampleVec(Vec<Sample>);

#[wasm_bindgen]
impl SampleVec {
    pub fn get_sample(&self, index: usize) -> Vec<f64> {
        vec![self.0[index].x.clone(), self.0[index].y.clone()]
    }
}

#[wasm_bindgen]
pub struct AxisBounds {
    mins: Sample,
    maxs: Sample,
}

impl AxisBounds {
    pub fn new() -> Self {
        AxisBounds {
            mins: Sample {
                x: f64::INFINITY,
                y: f64::INFINITY,
            },
            maxs: Sample {
                x: -f64::INFINITY,
                y: -f64::INFINITY,
            },
        }
    }

    pub fn add_sample(&mut self, x: f64, y: f64) {
        if x < self.mins.x {
            self.mins.x = x;
        }

        if x > self.maxs.x {
            self.maxs.x = x;
        }

        if y < self.mins.y {
            self.mins.x = y;
        }

        if y > self.maxs.y {
            self.maxs.x = y;
        }
    }
}

#[wasm_bindgen]
pub struct RegressorResult {
    predictions: Vec<f64>,
    axis_bounds: AxisBounds,
    // training_time: u128,
    // inference_time: u128,
}

#[wasm_bindgen]
impl RegressorResult {
    pub fn get_predictions(self) -> Vec<f64> {
        self.predictions
    }

    pub fn get_axis_bounds(self) -> AxisBounds {
        self.axis_bounds
    }
}

#[wasm_bindgen]
pub fn linear_regressor(x_samples: Vec<f64>, y_samples: Vec<f64>) -> RegressorResult {
    let samples: Vec<(f64, f64)> = zip(x_samples, y_samples).collect();

    // let training_set_time = Instant::now();

    let mut x_mean = 0.0;
    let mut y_mean = 0.0;

    for (x, y) in &samples {
        x_mean += x;
        y_mean += y;
    }

    x_mean = x_mean / (samples.len() as f64);
    y_mean = y_mean / (samples.len() as f64);

    let mut x_y_mean_diff_product_sum = 0.0;
    let mut x_mean_diff_squared_sum = 0.0;

    for (x, y) in &samples {
        let x_mean_diff = x - x_mean;

        x_y_mean_diff_product_sum += x_mean_diff * (y - y_mean);
        x_mean_diff_squared_sum += x_mean_diff * x_mean_diff;
    }

    let gradient = x_y_mean_diff_product_sum / x_mean_diff_squared_sum;
    let y_intercept = y_mean - gradient * x_mean;

    // let training_time = training_set_time.elapsed().as_millis();

    // let inference_start_time = Instant::now();

    let mut predictions: Vec<f64> = Vec::new();
    let mut axis_bounds = AxisBounds::new();

    for (x, y) in &samples {
        axis_bounds.add_sample(*x, *y);

        predictions.push((gradient * x + y_intercept).into());
    }

    // SampleVec(predictions)

    RegressorResult {
        predictions,
        axis_bounds,
        // training_time,
        // inference_time: inference_start_time.elapsed().as_millis(),
    }
}

#[test]
fn linear_regressor_test() {
    let x_samples = vec![3.4, -2.1, 5.0, 10.0, -6.1];
    let y_samples = vec![9.8, -1.2, 13.0, 23.0, -9.2];

    let predictions = linear_regressor(x_samples.clone(), y_samples.clone()).predictions;

    assert_eq!(
        y_samples.len(),
        predictions.len(),
        "Arrays don't have the same length"
    );

    println!("{:?}", y_samples);
    println!("{:?}", predictions);

    assert!(
        y_samples
            .iter()
            .zip(predictions.iter())
            .all(|(a, b)| a.abs() - b.abs() < 0.0001),
        "Arrays are not equal"
    );
}
