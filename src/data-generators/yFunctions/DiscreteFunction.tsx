
import YFunction from "./YFunction";

class DiscreteFunction implements YFunction {
  num_sections: number;
  num_intervals: number;
  initial_discrete_val: number;
  min_val: number;
  max_val: number;

  constructor(num_sections: number, min_val: number, max_val: number) {
    this.num_sections = num_sections;
    this.num_intervals = (max_val - min_val) / num_sections;
    this.initial_discrete_val = Math.random() < 0.5 ? 0 : 1;
    this.min_val = min_val; 
    this.max_val = max_val;
  }

  calcY(x: number) {
    let y = 0;
    let discrete_val = this.initial_discrete_val;

    for (let i = 1; i <= this.num_sections; i++) {
      if (this.min_val + i*this.num_intervals > x) {
        y = discrete_val;
        break;
      }

      discrete_val = discrete_val === 0 ? 1 : 0;
    }

    return y;
  }

  toString() {
    return `Discrete`;
  }
}

export default DiscreteFunction;