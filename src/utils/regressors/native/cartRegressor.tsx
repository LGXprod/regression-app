import { Samples } from "../../../types";
import AxisBounds from "../../chartConfig/AxisBounds";
import Loss from "./loss";

class Node {
  num: number;
  is_leaf: boolean;
  current_depth: number;
  left?: Node;
  right?: Node;

  constructor(num: number, is_leaf: boolean, current_depth = 0) {
    this.num = num;
    this.is_leaf = is_leaf;
    this.current_depth = current_depth;
  }

  add_node(direction: "left" | "right", node: Node) {
    node.current_depth = this.current_depth + 1;

    if (direction === "left") {
      this.left = node;
    } else {
      this.right = node;
    }
  }
}

class CartRegressor {
  samples: Samples;
  min_observations: number;
  decision_tree?: Node;

  constructor(samples: Samples, min_observations: number) {
    this.samples = samples.sort((a, b) => a.x - b.x);
    this.min_observations = min_observations;
  }

  calcY(x: number) {
    if (!this.decision_tree) {
      this.build_tree();
    }

    let node = this.decision_tree;

    if (!node) return -0.5; // temp to debug

    while (!node.is_leaf) {
      if (x <= node.num) {
        node = node.left!;
      } else {
        node = node.right!;
      }
    }

    return node.num;
  }

  predictSamples(testSet: Samples) {
    const inferenceTime = performance.now();

    const predictions: Samples = [];
    const axisBounds = new AxisBounds();

    const loss = new Loss();

    for (const { x, y } of testSet) {
      const y_pred = this.calcY(x);

      loss.addResidual(y, y_pred);

      axisBounds.addX(x);
      axisBounds.addY(y_pred);

      predictions.push({ x, y: y_pred });
    }

    return {
      predictions,
      testLoss: loss.getLossMetrics(),
      axisBounds: axisBounds.axisBounds,
      inferenceTime: +(performance.now() - inferenceTime).toFixed(2),
    };
  }

  build_tree() {
    const training_start_time = performance.now();

    const min = this.samples[0].x;
    const max = this.samples[this.samples.length - 1].x;

    this.decision_tree = this.build_tree_helper(min, max);

    return +(performance.now() - training_start_time).toFixed(2);
  }

  build_tree_helper(min: number, max: number, prev_optimal_split = Infinity, max_depth = 5) {
    const {
      optimal_split_num,
      num_samples_left,
      num_samples_right,
      left_y_avg,
      right_y_avg,
    } = this.get_optimal_split(min, max);
    console.log("here:", optimal_split_num, left_y_avg, right_y_avg);

    const node = new Node(optimal_split_num, false);

    // if (node.current_depth >= max_depth) {
    //   node.add_node("left", new Node(left_y_avg, true));
    //   node.add_node("right", new Node(right_y_avg, true));
    //   return node;
    // }

    if (
      optimal_split_num !== prev_optimal_split &&
      num_samples_left >= this.min_observations
    ) {
      node.add_node("left", this.build_tree_helper(min, optimal_split_num, optimal_split_num));
    } else {
      node.add_node("left", new Node(left_y_avg, true));
    }

    if (
      optimal_split_num !== prev_optimal_split &&
      num_samples_right >= this.min_observations
    ) {
      node.add_node("right", this.build_tree_helper(optimal_split_num, max, optimal_split_num));
    } else {
      node.add_node("right", new Node(right_y_avg, true));
    }

    return node;
  }

  get_optimal_split(min_x: number, max_x: number) {
    // console.log("here")
    const metrics_by_x = this.get_metrics_by_x(
      this.samples.filter(({ x }) => x >= min_x && x <= max_x)
    );

    let optimal_split_num: number = 0;
    let min_sum_of_squared_redisuals: number = Infinity;

    for (const [split_num, { sum_of_squared_redisuals }] of Object.entries(
      metrics_by_x
    )) {
      if (sum_of_squared_redisuals < min_sum_of_squared_redisuals) {
        optimal_split_num = parseFloat(split_num);
        min_sum_of_squared_redisuals = sum_of_squared_redisuals;
      }
    }

    let num_samples_left = 0;

    for (const { x } of this.samples) {
      if (x <= optimal_split_num) {
        num_samples_left++;
      }
    }

    // console.log("metrics_by_x", optimal_split_num, metrics_by_x);

    return {
      optimal_split_num,
      num_samples_left,
      num_samples_right: this.samples.length - num_samples_left,
      left_y_avg: metrics_by_x[optimal_split_num].left_y_avg,
      right_y_avg: metrics_by_x[optimal_split_num].right_y_avg,
    };
  }

  get_metrics_by_x(samples: Samples) {
    const metrics_by_x: {
      [key: number]: {
        sum_of_squared_redisuals: number;
        left_y_avg: number;
        right_y_avg: number;
      };
    } = {};

    for (const { x: split_num } of samples) {
      let left_y_avg: number = 0;
      let right_y_avg: number = 0;

      for (const { x, y } of samples) {
        if (x <= split_num) {
          left_y_avg += y;
          continue;
        }

        right_y_avg += y;
      }

      // console.log("here1:", split_num, left_y_avg, right_y_avg);
      left_y_avg = left_y_avg / samples.length;
      right_y_avg = right_y_avg / samples.length;
      // console.log("here2:", split_num, left_y_avg, right_y_avg);

      let sum_of_squared_redisuals = 0;

      for (const { x, y } of samples) {
        if (x <= split_num) {
          sum_of_squared_redisuals += Math.pow(y - left_y_avg, 2);
          continue;
        }

        sum_of_squared_redisuals += Math.pow(y - right_y_avg, 2);
      }

      metrics_by_x[split_num] = {
        sum_of_squared_redisuals,
        left_y_avg,
        right_y_avg,
      };
    }

    return metrics_by_x;
  }
}

export default CartRegressor;
