class Equation {
  terms: { coefficient: number; exponent: number; }[];
  independentVar: string;
  dependentVar: string;

  constructor(independentVar: string = "x", dependentVar: string = "y") {
    this.terms = [];
    this.independentVar = independentVar;
    this.dependentVar = dependentVar;
  }

  addTerm(coefficient: number, exponent: number) {
    if (exponent < 0) {
      throw new Error("Exponent must be greater than or equal to 0");
    }

    this.terms.push({ coefficient, exponent });
  }

  // get simplified() {
  //   const simplifiedTerms = [];

  //   let prevIsNegative = true;

  //   for (const [i, { coefficient, exponent }] of this.terms.entries()) {
  //     const isNegative = coefficient < 0;
  //     let updated_coefficient = coefficient;

  //     if (i === 0 && isNegative) updated_coefficient = -coefficient;
  //     if (prevIsNegative && isNegative) updated_coefficient = -coefficient;

  //     simplifiedTerms.push({updated_coefficient, exponent});

  //     prevIsNegative = isNegative;
  //   }

  //   return simplifiedTerms;
  // }

}

export default Equation;
