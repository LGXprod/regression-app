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
pub struct Result {
    predictions: Vec<Sample>,
    axis_bounds: AxisBounds,
    // training_time: u128,
    // inference_time: u128,
}

#[wasm_bindgen]
pub fn linear_regressor(x_samples: Vec<f64>, y_samples: Vec<f64>) -> SampleVec {
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

    let mut predictions: Vec<Sample> = Vec::new();
    let mut axis_bounds = AxisBounds::new();

    for (x, y) in &samples {
        axis_bounds.add_sample(*x, *y);

        predictions.push(Sample {
            x: (*x).into(),
            y: (gradient * (*x) + y_intercept).into(),
        });
    }

    SampleVec(predictions)

    // Result {
    //     predictions,
    //     axis_bounds,
    //     // training_time,
    //     // inference_time: inference_start_time.elapsed().as_millis(),
    // }
}

#[test]
fn linear_regressor_test() {
    let x = vec![3.4, -2.1, 5.0, 10.0, -6.1];
    let y = vec![9.8, -1.2, 13.0, 23.0, -9.2];

    let predictions = linear_regressor(x.clone(), y.clone()).predictions;
    let samples: Vec<(f64, f64)> = zip(x, y).collect();
    let mut ground_truth: Vec<Sample> = Vec::new();

    for (x, y) in &samples {
        ground_truth.push(Sample { x: *x, y: *y });
    }

    assert_eq!(
        ground_truth.len(),
        predictions.len(),
        "Arrays don't have the same length"
    );

    println!("{:?}", ground_truth);
    println!("{:?}", predictions);

    assert!(
        ground_truth
            .iter()
            .zip(predictions.iter())
            .all(|(a, b)| a.x.abs() - b.x.abs() < 0.0001 && a.y.abs() - b.y.abs() < 0.0001),
        "Arrays are not equal"
    );
}
