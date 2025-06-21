// Tutorial steps for Monty Hall Problem components

export const tutorial_1_7_1 = [
  {
    target: '[data-tutorial="door-selection"]',
    content: 'Welcome to the Monty Hall Problem! Start by clicking on any door. Behind one door is a car, behind the other two are goats.',
    placement: 'bottom'
  },
  {
    target: '[data-tutorial="auto-controls"]',
    content: 'Use these controls to run automatic simulations. You can choose different strategies: always stay, always switch, or random.',
    placement: 'top'
  },
  {
    target: '[data-tutorial="statistics"]',
    content: 'Watch the statistics update as you play. Notice how switching wins about 2/3 of the time!',
    placement: 'left'
  },
  {
    target: '[data-tutorial="probability-chart"]',
    content: 'This chart compares theoretical probabilities with your actual results. They should converge as you play more games.',
    placement: 'top'
  },
  {
    target: '[data-tutorial="learning-insights"]',
    content: 'As you interact with the simulation, you\'ll unlock insights about why switching is the better strategy.',
    placement: 'right'
  }
];

export const tutorial_1_7_2 = [
  {
    target: '[data-tutorial="door-choice"]',
    content: 'Choose a door to see how Bayes\' theorem explains the Monty Hall problem step by step.',
    placement: 'bottom'
  },
  {
    target: '[data-tutorial="probability-evolution"]',
    content: 'This visualization shows how probabilities change from prior (initial) to posterior (after Monty reveals a door).',
    placement: 'top'
  },
  {
    target: '[data-tutorial="bayesian-steps"]',
    content: 'Click through these steps to see the mathematical reasoning behind the 2/3 probability for switching.',
    placement: 'left'
  },
  {
    target: '[data-tutorial="decision-tree"]',
    content: 'The decision tree shows all possible outcomes and their probabilities, making it clear why switching is advantageous.',
    placement: 'top'
  }
];

export const tutorial_1_7_3 = [
  {
    target: '[data-tutorial="simulation-mode"]',
    content: 'Choose between animated mode (watch games play out) or instant mode (run many games at once).',
    placement: 'bottom'
  },
  {
    target: '[data-tutorial="convergence-chart"]',
    content: 'This chart shows how win rates converge to their theoretical values as more games are played - a demonstration of the Law of Large Numbers.',
    placement: 'top'
  },
  {
    target: '[data-tutorial="distribution-histogram"]',
    content: 'The histogram shows the distribution of wins and losses, clustering around the theoretical means.',
    placement: 'left'
  },
  {
    target: '[data-tutorial="convergence-status"]',
    content: 'Watch for the "Converged!" indicator - it appears when your results are statistically close to the theoretical values.',
    placement: 'bottom'
  }
];