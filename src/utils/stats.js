import * as jstat from "jstat";

export const distributions = {
  Normal: {
    pdf: (x) => jstat.normal.pdf(x, 0, 1),
    sample: () => jstat.normal.sample(0, 1),
    trueMean: 0,
    trueVar: 1,
  },
  Uniform: {
    pdf: (x) => (x < -Math.sqrt(3) || x > Math.sqrt(3) ? 0 : 0.5 / Math.sqrt(3)),
    sample: () => jstat.uniform.sample(-Math.sqrt(3), Math.sqrt(3)),
    trueMean: 0,
    trueVar: 1,
  },
  Exponential: {
    pdf: (x) => (x < 0 ? 0 : Math.exp(-x)),
    sample: () => jstat.exponential.sample(1),
    trueMean: 1,
    trueVar: 1,
  },
};
