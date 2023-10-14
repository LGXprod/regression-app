import { simplify } from "mathjs";
import { ComputeEngine } from "@cortex-js/compute-engine";

class Equation {
  terms: { coefficient: number; exponent: number }[];
  independentVar: string;
  dependentVar: string;
  isMultiplySymbol: boolean;

  constructor(isMultiplySymbol: boolean = false, independentVar: string = "x", dependentVar: string = "y") {
    this.terms = [];
    this.independentVar = independentVar;
    this.dependentVar = dependentVar;
    this.isMultiplySymbol = isMultiplySymbol;
  }

  addTerm(coefficient: number, exponent: number) {
    if (exponent < 0) {
      throw new Error("Exponent must be greater than or equal to 0");
    }

    this.terms.push({ coefficient, exponent });
  }

  getEquationString() {
    this.terms.sort((a, b) => b.exponent - a.exponent);

    let equationString = "";

    for (const [i, term] of this.terms.entries()) {
      const { coefficient, exponent } = term;

      if (coefficient === 0) {
        continue;
      }

      if (i > 0 && coefficient > 0) {
        equationString += " + ";
      }

      if (coefficient < 0) {
        equationString += " -";
        if (i > 0) equationString += " ";
      }

      equationString += Math.round(Math.abs(coefficient) * 10000) / 10000;

      if (exponent > 0) {
        equationString += this.independentVar;

        if (exponent > 1) {
          equationString += "^" + exponent;
        }
      }
    }

    equationString = `${this.dependentVar} = ${equationString}`

    return equationString;
  }
}

export default Equation;
