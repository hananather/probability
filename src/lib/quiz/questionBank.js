// Question bank for end-of-chapter quizzes
// High-quality questions with complete content coverage
//
// IMPORTANT: These are PRACTICE QUIZZES for self-assessment and learning.
// For graded assessments, please use your institution's secure testing platform.
// Answers are visible in client-side code for immediate feedback during practice.

export const chapterQuestions = {
  1: {
    title: "Chapter 1: Introduction to Probabilities",
    passingScore: 50, // 50% to pass
    timeLimit: 30, // minutes
    engineering: [
      // 1.1 Sample Spaces and Events
      {
        id: "ch1-q1",
        type: "multiple-choice",
        topic: "1.1 Sample Spaces and Events",
        difficulty: "easy",
        question: "A quality control engineer tests circuit boards for defects. Each board can be classified as 'pass' or 'fail'. If testing 3 boards, what is the sample space?",
        options: [
          "{P, F}",
          "{PPP, PPF, PFP, PFF, FPP, FPF, FFP, FFF}",
          "{0, 1, 2, 3}",
          "{PP, PF, FP, FF}"
        ],
        correct: 1,
        explanation: "The sample space contains all possible outcomes when testing 3 boards. Each board can be P (pass) or F (fail), giving us 2³ = 8 possible outcomes."
      },
      
      {
        id: "ch1-q2",
        type: "multi-select",
        topic: "1.1 Sample Spaces and Events",
        difficulty: "medium",
        question: "In a manufacturing process, let A = 'product meets weight specifications' and B = 'product meets dimension specifications'. Which of the following statements are true? (Select all that apply)",
        options: [
          "A ∩ B represents products meeting both specifications",
          "A ∪ B represents products meeting at least one specification",
          "If A and B are independent, then P(A ∩ B) = 0",
          "Aᶜ represents products that fail weight specifications"
        ],
        correct: [0, 1, 3],
        explanation: "Statements 1, 2, and 4 are true. Statement 3 is false - independence means P(A ∩ B) = P(A)×P(B), not 0."
      },
      
      // 1.2 Counting Techniques
      {
        id: "ch1-q3",
        type: "multiple-choice",
        topic: "1.2 Counting Techniques",
        difficulty: "easy",
        question: "A factory has 5 different machine settings and 3 different material types. How many different production configurations are possible?",
        options: [
          "8",
          "15",
          "35",
          "53"
        ],
        correct: 1,
        explanation: "By the multiplication principle, total configurations = 5 × 3 = 15"
      },
      
      // 1.3 Ordered Samples
      {
        id: "ch1-q4",
        type: "multiple-choice",
        topic: "1.3 Ordered Samples - With Replacement",
        difficulty: "medium",
        question: "A PIN code consists of 4 digits (0-9). How many different PIN codes are possible?",
        options: [
          "40",
          "5,040",
          "10,000",
          "6,561"
        ],
        correct: 2,
        explanation: "With replacement, each position can be any of 10 digits: 10⁴ = 10,000"
      },
      
      {
        id: "ch1-q5",
        type: "multiple-choice",
        topic: "1.3 Ordered Samples - Without Replacement",
        difficulty: "medium",
        question: "A manager needs to assign 3 different engineers to 3 different projects from a team of 10 engineers. How many ways can this be done?",
        options: [
          "120",
          "720",
          "1,000",
          "30"
        ],
        correct: 1,
        explanation: "This is a permutation without replacement: P(10,3) = 10!/(10-3)! = 10×9×8 = 720"
      },
      
      // 1.4 Unordered Samples
      {
        id: "ch1-q6",
        type: "multiple-choice",
        topic: "1.4 Unordered Samples",
        difficulty: "medium",
        question: "A quality team needs to select 3 products for inspection from a batch of 10 products. How many different selections are possible?",
        options: [
          "30",
          "120",
          "720",
          "1,000"
        ],
        correct: 1,
        explanation: "This is a combination: C(10,3) = 10!/(3!×7!) = (10×9×8)/(3×2×1) = 120"
      },
      
      {
        id: "ch1-q7",
        type: "multi-select",
        topic: "1.4 Combinations vs Permutations",
        difficulty: "hard",
        question: "Which scenarios require combinations (not permutations)? (Select all that apply)",
        options: [
          "Selecting 5 components for testing from 20 components",
          "Arranging 5 machines in a production line",
          "Choosing 3 team members for a committee from 10 employees",
          "Assigning first, second, and third prizes to 3 winners"
        ],
        correct: [0, 2],
        explanation: "Combinations are used when order doesn't matter (selecting/choosing). Permutations are used when order matters (arranging/assigning ranks)."
      },
      
      // 1.5 Probability of an Event
      {
        id: "ch1-q8",
        type: "multiple-choice",
        topic: "1.5 Probability of an Event",
        difficulty: "easy",
        question: "Two machines each have a 0.2 probability of breaking down on any given day, and breakdowns are independent. What is the probability that both machines work properly on a given day?",
        options: [
          "0.04",
          "0.16",
          "0.64",
          "0.96"
        ],
        correct: 2,
        explanation: "P(both work) = P(A works) × P(B works) = 0.8 × 0.8 = 0.64"
      },
      
      {
        id: "ch1-q9",
        type: "multiple-choice",
        topic: "1.5 Probability Axioms",
        difficulty: "medium",
        question: "Events A and B have P(A) = 0.6, P(B) = 0.5, and P(A ∩ B) = 0.3. What is P(A ∪ B)?",
        options: [
          "0.8",
          "0.9",
          "1.1",
          "0.3"
        ],
        correct: 0,
        explanation: "By the addition rule: P(A ∪ B) = P(A) + P(B) - P(A ∩ B) = 0.6 + 0.5 - 0.3 = 0.8"
      },
      
      // 1.6 Conditional Probability
      {
        id: "ch1-q10",
        type: "multiple-choice",
        topic: "1.6 Conditional Probability",
        difficulty: "medium",
        question: "In a factory, 70% of products pass initial inspection. Of those that pass, 90% also pass final inspection. What is the probability a randomly selected product passes both inspections?",
        options: [
          "0.160",
          "0.630",
          "0.777",
          "0.900"
        ],
        correct: 1,
        explanation: "P(pass both) = P(pass initial) × P(pass final | pass initial) = 0.7 × 0.9 = 0.63"
      },
      
      {
        id: "ch1-q11",
        type: "multiple-choice",
        topic: "1.6 Independence",
        difficulty: "hard",
        question: "Events A and B have P(A) = 0.4, P(B) = 0.3. If A and B are independent, what is P(A | B)?",
        options: [
          "0.12",
          "0.3",
          "0.4",
          "0.7"
        ],
        correct: 2,
        explanation: "If A and B are independent, then P(A | B) = P(A) = 0.4"
      },
      
      // 1.7 Bayes' Theorem
      {
        id: "ch1-q12",
        type: "multiple-choice",
        topic: "1.7 Bayes' Theorem",
        difficulty: "hard",
        question: "A diagnostic test for defective chips has a 95% sensitivity (detects defects when present) and 98% specificity (correctly identifies good chips). If 2% of chips are defective, what is the probability a chip is actually defective given a positive test?",
        options: [
          "0.493",
          "0.950",
          "0.020",
          "0.980"
        ],
        correct: 0,
        explanation: "Using Bayes' theorem: P(defective|positive) = (0.95×0.02)/((0.95×0.02)+(0.02×0.98)) ≈ 0.493"
      },
      
      // Law of Total Probability
      {
        id: "ch1-q13",
        type: "multiple-choice",
        topic: "1.6 Law of Total Probability",
        difficulty: "hard",
        question: "A company has three suppliers: A (50% of orders), B (30%), and C (20%). Defect rates are 2%, 3%, and 1% respectively. What is the overall defect rate?",
        options: [
          "2.0%",
          "2.1%",
          "2.3%",
          "6.0%"
        ],
        correct: 1,
        explanation: "P(defect) = 0.5×0.02 + 0.3×0.03 + 0.2×0.01 = 0.01 + 0.009 + 0.002 = 0.021 = 2.1%"
      },
      
      // Mutual Exclusivity vs Independence
      {
        id: "ch1-q14",
        type: "multi-select",
        topic: "1.6 Independence vs Mutual Exclusivity",
        difficulty: "hard",
        question: "Which statements about events A and B are ALWAYS true? (Select all that apply)",
        options: [
          "If A and B are mutually exclusive and P(A) > 0, P(B) > 0, then they cannot be independent",
          "If A and B are independent, then P(A ∩ B) = P(A) × P(B)",
          "If A and B are independent, then they cannot be mutually exclusive (assuming P(A) > 0, P(B) > 0)",
          "If P(A | B) = P(A), then A and B must be mutually exclusive"
        ],
        correct: [0, 1, 2],
        explanation: "Statements 1, 2, and 3 are true. Statement 4 is false - P(A|B) = P(A) indicates independence, not mutual exclusivity."
      },
      
      // Probabilistic Fallacies
      {
        id: "ch1-q15",
        type: "multiple-choice",
        topic: "Appendix - Probabilistic Fallacies",
        difficulty: "medium",
        question: "A fair coin has landed heads 5 times in a row. What is the probability the next flip is heads?",
        options: [
          "Less than 0.5 (due to law of averages)",
          "Exactly 0.5",
          "Greater than 0.5 (hot streak)",
          "1/64"
        ],
        correct: 1,
        explanation: "Each coin flip is independent. The probability remains 0.5 regardless of previous outcomes. This is the gambler's fallacy."
      }
    ],
    
    // Biostats version (same concepts, medical context)
    biostats: [
      {
        id: "ch1-b-q1",
        type: "multiple-choice",
        topic: "1.1 Sample Spaces and Events",
        difficulty: "easy",
        question: "A clinical trial tests patients for response to treatment. Each patient can be classified as 'responder' or 'non-responder'. If testing 3 patients, what is the sample space?",
        options: [
          "{R, N}",
          "{RRR, RRN, RNR, RNN, NRR, NRN, NNR, NNN}",
          "{0, 1, 2, 3}",
          "{RR, RN, NR, NN}"
        ],
        correct: 1,
        explanation: "The sample space contains all possible outcomes when testing 3 patients. Each can be R (responder) or N (non-responder), giving us 2³ = 8 possible outcomes."
      }
      // ... additional biostats questions would follow the same pattern
    ],
    
    // Social science version
    social: [
      {
        id: "ch1-s-q1",
        type: "multiple-choice",
        topic: "1.1 Sample Spaces and Events",
        difficulty: "easy",
        question: "A survey asks respondents whether they 'agree' or 'disagree' with a statement. If surveying 3 people, what is the sample space?",
        options: [
          "{A, D}",
          "{AAA, AAD, ADA, ADD, DAA, DAD, DDA, DDD}",
          "{0, 1, 2, 3}",
          "{AA, AD, DA, DD}"
        ],
        correct: 1,
        explanation: "The sample space contains all possible outcomes when surveying 3 people. Each can be A (agree) or D (disagree), giving us 2³ = 8 possible outcomes."
      }
      // ... additional social science questions would follow
    ]
  },
  
  // Placeholder for other chapters
  2: {
    title: "Chapter 2: Discrete Random Variables",
    passingScore: 50,
    timeLimit: 30,
    engineering: [
      // 2.1 Random Variables and PMF
      {
        id: "ch2-q1",
        type: "multiple-choice",
        topic: "2.1 Random Variables and Probability Mass Functions",
        difficulty: "easy",
        question: "Which of the following is a valid property of a probability mass function f(x) for a discrete random variable X?",
        options: [
          "f(x) can be negative for some values of x",
          "The sum of all f(x) values equals 1",
          "f(x) must be greater than 1 for at least one value of x",
          "f(x) only takes integer values"
        ],
        correct: 1,
        explanation: "A probability mass function must satisfy: 0 ≤ f(x) ≤ 1 for all x, and the sum of all f(x) values over the domain equals 1.",
        helpLink: "/chapter2/random-variables"
      },
      
      {
        id: "ch2-q2",
        type: "multiple-choice", 
        topic: "2.2 Expectation and Variance",
        difficulty: "easy",
        question: "If a discrete random variable X has expectation E[X] = 5, what is E[2X + 3]?",
        options: [
          "10",
          "13", 
          "7",
          "16"
        ],
        correct: 1,
        explanation: "Using the linearity of expectation: E[2X + 3] = 2E[X] + 3 = 2(5) + 3 = 13.",
        helpLink: "/chapter2/expectation-variance"
      },

      {
        id: "ch2-q3",
        type: "multiple-choice",
        topic: "2.3 Binomial Distribution",
        difficulty: "easy", 
        question: "In a binomial experiment with n = 10 trials and probability of success p = 0.3, what is the expected number of successes?",
        options: [
          "3.0",
          "2.1",
          "7.0", 
          "3.3"
        ],
        correct: 0,
        explanation: "For a binomial distribution B(n,p), the expected value is E[X] = np = 10 × 0.3 = 3.0 successes.",
        helpLink: "/chapter2/binomial-distribution"
      },

      {
        id: "ch2-q4",
        type: "multiple-choice",
        topic: "2.6 Poisson Distribution",
        difficulty: "easy",
        question: "For a Poisson distribution with parameter λ = 4, what are the mean and variance?",
        options: [
          "Mean = 4, Variance = 2",
          "Mean = 4, Variance = 4",
          "Mean = 2, Variance = 4",
          "Mean = 4, Variance = 16"
        ],
        correct: 1,
        explanation: "A key property of the Poisson distribution is that the mean and variance are both equal to the parameter λ.",
        helpLink: "/chapter2/poisson-distribution"
      },

      {
        id: "ch2-q5", 
        type: "multiple-choice",
        topic: "2.1 Cumulative Distribution Function",
        difficulty: "easy",
        question: "For a discrete random variable X, if P(X = 2) = 0.3 and P(X ≤ 2) = 0.7, what is P(X < 2)?",
        options: [
          "0.4",
          "0.3",
          "0.7", 
          "1.0"
        ],
        correct: 0,
        explanation: "P(X < 2) = P(X ≤ 2) - P(X = 2) = 0.7 - 0.3 = 0.4.",
        helpLink: "/chapter2/random-variables"
      },

      // Medium Questions
      {
        id: "ch2-q6",
        type: "multiple-choice",
        topic: "2.3 Binomial Distribution Applications",
        difficulty: "medium",
        question: "A quality control inspector tests electronic components where 5% are defective. If she tests 20 components, what is the probability that exactly 2 are defective?",
        options: [
          "0.189",
          "0.264",
          "0.377",
          "0.100"
        ],
        correct: 0,
        explanation: "This follows a binomial distribution B(20, 0.05). P(X = 2) = C(20,2) × (0.05)² × (0.95)¹⁸ ≈ 0.189.",
        helpLink: "/chapter2/binomial-distribution"
      },

      {
        id: "ch2-q7",
        type: "multiple-choice", 
        topic: "2.4 Geometric Distribution",
        difficulty: "medium",
        question: "In a manufacturing process, each item has a 0.1 probability of being defective. What is the expected number of items that need to be inspected to find the first defective one?",
        options: [
          "5",
          "10",
          "15", 
          "20"
        ],
        correct: 1,
        explanation: "For a geometric distribution with parameter p = 0.1, the expected value is E[X] = 1/p = 1/0.1 = 10 items.",
        helpLink: "/chapter2/geometric-distribution"
      },

      {
        id: "ch2-q8",
        type: "multi-select",
        topic: "2.2 Properties of Expectation and Variance", 
        difficulty: "medium",
        question: "Which of the following properties are true for discrete random variables? (Select all that apply)",
        options: [
          "E[X + Y] = E[X] + E[Y]",
          "Var[X + a] = Var[X] for any constant a",
          "E[XY] = E[X]E[Y] always",
          "Var[aX] = a²Var[X] for any constant a"
        ],
        correct: [0, 1, 3],
        explanation: "Properties (a), (b), and (d) are correct. However, E[XY] = E[X]E[Y] only holds when X and Y are independent.",
        helpLink: "/chapter2/expectation-variance"
      },

      {
        id: "ch2-q9",
        type: "multiple-choice",
        topic: "2.6 Poisson Applications",
        difficulty: "medium", 
        question: "A hospital emergency room receives an average of 3 patients per hour. What is the probability of receiving exactly 2 patients in the next hour?",
        options: [
          "0.224",
          "0.149",
          "0.199",
          "0.299"
        ],
        correct: 0,
        explanation: "Using Poisson distribution with λ = 3: P(X = 2) = (3² × e⁻³)/2! = (9 × 0.0498)/2 = 0.224.",
        helpLink: "/chapter2/poisson-distribution"
      },

      {
        id: "ch2-q10",
        type: "multiple-choice",
        topic: "2.5 Negative Binomial Distribution",
        difficulty: "medium",
        question: "A basketball player makes free throws with probability 0.8. What is the expected number of shots needed to make exactly 3 successful free throws?",
        options: [
          "3.75", 
          "4.0",
          "3.0",
          "5.0"
        ],
        correct: 0,
        explanation: "For a negative binomial distribution with r = 3 successes and p = 0.8, the expected value is E[X] = r/p = 3/0.8 = 3.75 shots.",
        helpLink: "/chapter2/negative-binomial"
      },

      {
        id: "ch2-q11",
        type: "multi-select",
        topic: "2.1 Random Variables and Distributions",
        difficulty: "medium",
        question: "A discrete random variable X has the following probability mass function: P(X=-1)=0.2, P(X=0)=0.5, P(X=1)=0.3. Which statements are correct? (Select all that apply)",
        options: [
          "This is a valid probability mass function",
          "P(X ≤ 0) = 0.7", 
          "P(X ≥ 0) = 0.5",
          "The expected value E[X] = 0.1"
        ],
        correct: [0, 1, 3],
        explanation: "Statements 1, 2, and 4 are correct. Statement 3 is false - P(X ≥ 0) = P(X=0) + P(X=1) = 0.5 + 0.3 = 0.8, not 0.5. E[X] = -1(0.2) + 0(0.5) + 1(0.3) = 0.1.",
        helpLink: "/chapter2/random-variables"
      },

      {
        id: "ch2-q12", 
        type: "multiple-choice",
        topic: "2.2 Variance Calculation",
        difficulty: "medium",
        question: "For a random variable X with E[X] = 4 and E[X²] = 20, what is Var[X]?",
        options: [
          "16",
          "4", 
          "20",
          "24"
        ],
        correct: 1,
        explanation: "Using the formula Var[X] = E[X²] - (E[X])² = 20 - 4² = 20 - 16 = 4.",
        helpLink: "/chapter2/expectation-variance"
      },

      {
        id: "ch2-q13",
        type: "multiple-choice",
        topic: "2.6 Poisson Process Applications", 
        difficulty: "medium",
        question: "Customers arrive at a service counter following a Poisson process with rate 2 customers per minute. What is the probability that exactly 4 customers arrive in a 2-minute period?",
        options: [
          "0.195",
          "0.147", 
          "0.238",
          "0.183"
        ],
        correct: 0,
        explanation: "For a 2-minute period, λ = 2 × 2 = 4. P(X = 4) = (4⁴ × e⁻⁴)/4! = (256 × 0.0183)/24 ≈ 0.195.",
        helpLink: "/chapter2/poisson-distribution"
      },

      // Hard Questions
      {
        id: "ch2-q14",
        type: "multi-select",
        topic: "2.3 Binomial Distribution Analysis",
        difficulty: "hard",
        question: "An airline overbooks flights, selling 102 tickets for a 100-seat flight. Each passenger independently has a 0.95 probability of showing up. Which statements about the probability of overbooking are correct? (Select all that apply)",
        options: [
          "This can be modeled as a binomial distribution B(102, 0.95)",
          "The variance of passengers showing up is 4.845",
          "The expected number of passengers showing up is 102",
          "The probability of overbooking is P(X > 100) where X ~ B(102, 0.95)"
        ],
        correct: [0, 1, 3],
        explanation: "Statements 1, 2, and 4 are correct. Statement 3 is false - E[X] = np = 102 × 0.95 = 96.9, not 102. Variance = np(1-p) = 102 × 0.95 × 0.05 = 4.845.",
        helpLink: "/chapter2/binomial-distribution"
      },

      {
        id: "ch2-q15",
        type: "multiple-choice",
        topic: "2.1 Cumulative Distribution Function Analysis",
        difficulty: "hard", 
        question: "A discrete random variable X has CDF values F(1) = 0.3, F(2) = 0.6, F(3) = 0.9, F(4) = 1.0. If we know X only takes integer values from 1 to 4, what is P(1 < X ≤ 3)?",
        options: [
          "0.6",
          "0.3",
          "0.9",
          "0.7"
        ],
        correct: 0,
        explanation: "P(1 < X ≤ 3) = P(X ≤ 3) - P(X ≤ 1) = F(3) - F(1) = 0.9 - 0.3 = 0.6.",
        helpLink: "/chapter2/random-variables"
      },

      {
        id: "ch2-q16",
        type: "multiple-choice",
        topic: "2.5 Negative Binomial Applications",
        difficulty: "hard",
        question: "In drug development, each trial has a 0.3 probability of success. A pharmaceutical company wants to achieve exactly 4 successful trials. What is the probability that they need exactly 10 trials total?",
        options: [
          "0.090",
          "0.051", 
          "0.123",
          "0.074"
        ],
        correct: 3,
        explanation: "This follows negative binomial: P(X = 10) = C(9,3) × (0.3)⁴ × (0.7)⁶ = 84 × 0.0081 × 0.1176 ≈ 0.074.",
        helpLink: "/chapter2/negative-binomial"
      },

      {
        id: "ch2-q17",
        type: "multi-select", 
        topic: "2.6 Poisson vs Other Distributions",
        difficulty: "medium",
        question: "Which scenarios would be appropriately modeled using a Poisson distribution? (Select all that apply)",
        options: [
          "Number of email messages received per day",
          "Number of defects in a fixed length of fiber optic cable", 
          "Number of heads in 20 coin flips",
          "Number of customers entering a store per hour"
        ],
        correct: [0, 1, 3],
        explanation: "Poisson distributions model rare events occurring over continuous intervals of time or space. Coin flips follow a binomial distribution.",
        helpLink: "/chapter2/poisson-distribution"
      },

      {
        id: "ch2-q18",
        type: "multiple-choice",
        topic: "2.4 Geometric Distribution Applications", 
        difficulty: "medium",
        question: "In quality control, items are tested sequentially until a defective one is found. If 3% of items are defective, what is the probability that the first defective item is found on the 5th test?",
        options: [
          "0.0267",
          "0.0291",
          "0.0312", 
          "0.0283"
        ],
        correct: 0,
        explanation: "For geometric distribution: P(X = 5) = (1-p)⁴ × p = (0.97)⁴ × 0.03 = 0.8885 × 0.03 ≈ 0.0267.",
        helpLink: "/chapter2/geometric-distribution"
      }
    ],
    biostats: [],
    social: []
  },
  
  3: {
    title: "Chapter 3: Continuous Random Variables",
    passingScore: 50,
    timeLimit: 35,
    engineering: [
      // 3.1 Continuous Random Variables - PDFs
      {
        id: "ch3-q1",
        type: "multiple-choice",
        topic: "3.1 Probability Density Functions",
        difficulty: "easy",
        question: "What is the key difference between a probability mass function (discrete) and a probability density function (continuous)?",
        options: [
          "PDFs can be negative, PMFs cannot",
          "For continuous variables, P(X = x) = 0 for any specific value x",
          "PDFs must sum to 1, PMFs must integrate to 1",
          "There is no difference"
        ],
        correct: 1,
        explanation: "For continuous random variables, the probability of taking any specific value is zero. The PDF represents probability density, not probability itself.",
        helpLink: "/chapter3/pdf-basics"
      },

      {
        id: "ch3-q2",
        type: "multiple-choice",
        topic: "3.1 Cumulative Distribution Functions",
        difficulty: "easy",
        question: "A sensor measurement X has PDF f(x) = x/2 for 0 ≤ x ≤ 2, and 0 elsewhere. What is P(0.5 < X < 1.5)?",
        options: [
          "0.25",
          "0.50",
          "0.75",
          "1.00"
        ],
        correct: 1,
        explanation: "P(0.5 < X < 1.5) = ∫₀.₅¹·⁵ (x/2)dx = [x²/4]₀.₅¹·⁵ = (1.5²/4) - (0.5²/4) = 9/16 - 1/16 = 8/16 = 0.5",
        helpLink: "/chapter3/pdf-integration"
      },

      {
        id: "ch3-q3",
        type: "multiple-choice",
        topic: "3.2 Expectation of Continuous Variables",
        difficulty: "medium",
        question: "A manufacturing process produces parts with thickness X having PDF f(x) = 3x² for 0 ≤ x ≤ 1. What is E[X]?",
        options: [
          "0.5",
          "0.6",
          "0.75",
          "0.9"
        ],
        correct: 2,
        explanation: "E[X] = ∫₀¹ x · 3x² dx = ∫₀¹ 3x³ dx = [3x⁴/4]₀¹ = 3/4 = 0.75",
        helpLink: "/chapter3/continuous-expectation"
      },

      {
        id: "ch3-q4",
        type: "multi-select",
        topic: "3.1 Properties of PDFs",
        difficulty: "medium",
        question: "Which conditions must a function f(x) satisfy to be a valid probability density function? (Select all that apply)",
        options: [
          "f(x) ≥ 0 for all x in the domain",
          "∫ f(x)dx = 1 over the entire domain",
          "f(x) ≤ 1 for all x",
          "f'(x) exists everywhere"
        ],
        correct: [0, 1],
        explanation: "A valid PDF must be non-negative and integrate to 1. It doesn't need to be bounded by 1 or differentiable everywhere.",
        helpLink: "/chapter3/pdf-properties"
      },

      // 3.3 Normal Distributions
      {
        id: "ch3-q5",
        type: "multiple-choice",
        topic: "3.3 Standard Normal Distribution",
        difficulty: "easy",
        question: "For the standard normal distribution N(0,1), what is P(Z ≤ 0)?",
        options: [
          "0.0",
          "0.5",
          "1.0",
          "Cannot be determined"
        ],
        correct: 1,
        explanation: "The standard normal distribution is symmetric about 0, so P(Z ≤ 0) = 0.5",
        helpLink: "/chapter3/standard-normal"
      },

      {
        id: "ch3-q6",
        type: "multiple-choice",
        topic: "3.3 Normal Distribution Applications",
        difficulty: "medium",
        question: "Component lifetimes are normally distributed with mean 500 hours and standard deviation 50 hours. What percentage of components last between 450 and 550 hours?",
        options: [
          "68%",
          "95%",
          "99.7%",
          "Cannot determine without tables"
        ],
        correct: 0,
        explanation: "This range is μ ± σ (500 ± 50), which contains approximately 68% of values in a normal distribution.",
        helpLink: "/chapter3/normal-applications"
      },

      {
        id: "ch3-q7",
        type: "multiple-choice",
        topic: "3.3 Normal Standardization",
        difficulty: "medium",
        question: "Quality control requires that product weights X ~ N(100, 25) grams. What is the probability that a randomly selected product weighs more than 110 grams?",
        options: [
          "P(Z > 2)",
          "P(Z > 10)",
          "P(Z > 0.4)",
          "P(Z > 4)"
        ],
        correct: 0,
        explanation: "Standardize: Z = (X - μ)/σ = (110 - 100)/5 = 2, so P(X > 110) = P(Z > 2)",
        helpLink: "/chapter3/normal-standardization"
      },

      // 3.4 Exponential Distributions
      {
        id: "ch3-q8",
        type: "multiple-choice",
        topic: "3.4 Exponential Distribution",
        difficulty: "easy",
        question: "System failures follow an exponential distribution with rate λ = 0.1 per hour. What is the mean time between failures?",
        options: [
          "0.1 hours",
          "1 hour",
          "10 hours",
          "100 hours"
        ],
        correct: 2,
        explanation: "For exponential distribution Exp(λ), the mean is 1/λ = 1/0.1 = 10 hours",
        helpLink: "/chapter3/exponential-properties"
      },

      {
        id: "ch3-q9",
        type: "multiple-choice",
        topic: "3.4 Memoryless Property",
        difficulty: "hard",
        question: "A component has exponentially distributed lifetime with mean 8 years. Given it has survived 5 years, what's the probability it survives another 3 years?",
        options: [
          "P(X > 3) where X ~ Exp(1/8)",
          "P(X > 8)",
          "3/8",
          "5/8"
        ],
        correct: 0,
        explanation: "By the memoryless property: P(X > s+t | X > s) = P(X > t). So P(X > 8 | X > 5) = P(X > 3).",
        helpLink: "/chapter3/memoryless-property"
      },

      // 3.5 Gamma Distributions  
      {
        id: "ch3-q10",
        type: "multiple-choice",
        topic: "3.5 Gamma Distribution",
        difficulty: "medium",
        question: "Customer arrivals follow a Poisson process with rate λ = 2 per minute. What distribution does the waiting time until the 3rd customer follow?",
        options: [
          "Exponential(2)",
          "Poisson(2)",
          "Gamma(2, 3)",
          "Gamma(λ=2, r=3)"
        ],
        correct: 3,
        explanation: "The waiting time until the rth arrival in a Poisson process follows Gamma(λ, r), so Gamma(2, 3).",
        helpLink: "/chapter3/gamma-distribution"
      },

      {
        id: "ch3-q11",
        type: "multiple-choice",
        topic: "3.5 Gamma vs Exponential",
        difficulty: "medium",
        question: "What is the relationship between Gamma and Exponential distributions?",
        options: [
          "They are unrelated",
          "Exponential is a special case of Gamma with r = 1",
          "Gamma is a special case of Exponential",
          "They have the same variance"
        ],
        correct: 1,
        explanation: "The exponential distribution Exp(λ) is equivalent to Gamma(λ, 1), making it a special case of the Gamma distribution.",
        helpLink: "/chapter3/exponential-gamma-relationship"
      },

      // 3.6 Joint Distributions
      {
        id: "ch3-q12",
        type: "multiple-choice",
        topic: "3.6 Joint Probability Density",
        difficulty: "medium",
        question: "Two variables X and Y have joint PDF f(x,y) = 2 for 0 ≤ y ≤ x ≤ 1. What is P(X ≤ 0.5)?",
        options: [
          "0.125",
          "0.25",
          "0.5",
          "0.75"
        ],
        correct: 1,
        explanation: "P(X ≤ 0.5) = ∫₀^(0.5) ∫₀^x 2 dy dx = ∫₀^(0.5) 2x dx = [x²]₀^(0.5) = 0.25",
        helpLink: "/chapter3/joint-distributions"
      },

      {
        id: "ch3-q13",
        type: "multi-select",
        topic: "3.6 Independence in Continuous Case",
        difficulty: "hard",
        question: "For continuous random variables X and Y to be independent, which conditions must hold? (Select all that apply)",
        options: [
          "f(x,y) = f_X(x) · f_Y(y) for all x,y",
          "P(X ≤ x, Y ≤ y) = P(X ≤ x) · P(Y ≤ y) for all x,y",
          "The support of the joint PDF must be rectangular",
          "E[XY] = E[X]E[Y]"
        ],
        correct: [0, 1, 3],
        explanation: "Independence requires factorization of the joint PDF, CDF, and expectations. Rectangular support is sufficient but not necessary.",
        helpLink: "/chapter3/continuous-independence"
      },

      // 3.7 Normal Approximation
      {
        id: "ch3-q14",
        type: "multiple-choice",
        topic: "3.7 Normal Approximation to Binomial",
        difficulty: "medium",
        question: "A binomial random variable X ~ B(100, 0.3) is approximated by a normal distribution. What are the parameters of this normal approximation?",
        options: [
          "N(30, 9)",
          "N(30, 21)",
          "N(70, 21)",
          "N(100, 30)"
        ],
        correct: 1,
        explanation: "For X ~ B(n,p), the normal approximation is N(np, np(1-p)) = N(100×0.3, 100×0.3×0.7) = N(30, 21)",
        helpLink: "/chapter3/normal-approximation"
      },

      {
        id: "ch3-q15",
        type: "multiple-choice", 
        topic: "3.7 Continuity Correction",
        difficulty: "hard",
        question: "Using normal approximation with continuity correction, how would you approximate P(X = 25) for X ~ B(100, 0.2)?",
        options: [
          "P(24.5 < Z < 25.5) where Z ~ N(20, 16)",
          "P(Z = 25) where Z ~ N(20, 16)",
          "P(Z < 25) where Z ~ N(20, 16)",
          "P(Z > 25) where Z ~ N(20, 16)"
        ],
        correct: 0,
        explanation: "For continuity correction, P(X = k) ≈ P(k-0.5 < Z < k+0.5) where Z ~ N(np, np(1-p)) = N(20, 16)",
        helpLink: "/chapter3/continuity-correction"
      },

      // Challenging Applications
      {
        id: "ch3-q16",
        type: "multiple-choice",
        topic: "3.2 Variance of Continuous Variables", 
        difficulty: "hard",
        question: "A random variable X has PDF f(x) = 2x for 0 ≤ x ≤ 1. What is Var(X)?",
        options: [
          "1/18",
          "1/12",
          "1/9",
          "1/6"
        ],
        correct: 0,
        explanation: "E[X] = ∫₀¹ x(2x)dx = 2/3. E[X²] = ∫₀¹ x²(2x)dx = 1/2. Var(X) = E[X²] - (E[X])² = 1/2 - (2/3)² = 1/2 - 4/9 = 1/18",
        helpLink: "/chapter3/continuous-variance"
      },

      {
        id: "ch3-q17",
        type: "multi-select",
        topic: "3.4 Exponential Properties",
        difficulty: "hard",
        question: "Which statements about exponential distributions are true? (Select all that apply)",
        options: [
          "The exponential distribution has the memoryless property",
          "If X ~ Exp(λ), then P(X > t) = e^(-λt)",
          "The median equals the mean",
          "The mode is always zero"
        ],
        correct: [0, 1, 3],
        explanation: "Statements 1, 2, and 4 are true. Statement 3 is false - the median = ln(2)/λ ≈ 0.693/λ, while mean = 1/λ, so median < mean.",
        helpLink: "/chapter3/exponential-properties"
      },

      {
        id: "ch3-q18",
        type: "multiple-choice",
        topic: "3.3 Normal Distribution Calculations",
        difficulty: "hard", 
        question: "Electronic component tolerances X ~ N(5.0, 0.04). What value c satisfies P(|X - 5| < c) = 0.95?",
        options: [
          "0.196",
          "0.392",
          "1.96",
          "3.92"
        ],
        correct: 1,
        explanation: "P(|X-5| < c) = P(-c < X-5 < c) = 0.95. Standardizing: P(-c/0.2 < Z < c/0.2) = 0.95. This gives c/0.2 = 1.96, so c = 0.392.",
        helpLink: "/chapter3/normal-intervals"
      }
    ],

    // Biostats version with medical/health contexts
    biostats: [
      {
        id: "ch3-b-q1", 
        type: "multiple-choice",
        topic: "3.1 Probability Density Functions",
        difficulty: "easy",
        question: "In medical research, what does it mean that P(Height = 170.0cm) = 0 for a continuous height distribution?",
        options: [
          "No one is exactly 170cm tall",
          "The probability of any exact height is zero due to infinite precision",
          "The measurement is incorrect", 
          "170cm is outside the normal range"
        ],
        correct: 1,
        explanation: "For continuous variables like height, the probability of any exact value is zero because there are infinitely many possible values.",
        helpLink: "/chapter3/continuous-probability"
      },

      {
        id: "ch3-b-q2",
        type: "multiple-choice", 
        topic: "3.3 Normal Distribution in Medicine",
        difficulty: "medium",
        question: "Systolic blood pressure in adults follows N(120, 400) mmHg. What percentage of adults have blood pressure between 100 and 140 mmHg?",
        options: [
          "68%",
          "95%", 
          "99.7%",
          "Cannot determine"
        ],
        correct: 1,
        explanation: "This range is 120 ± 2(20) = 120 ± 40, which is μ ± 2σ, containing approximately 95% of values.",
        helpLink: "/chapter3/normal-medical"
      },

      {
        id: "ch3-b-q3",
        type: "multiple-choice",
        topic: "3.4 Exponential in Survival Analysis", 
        difficulty: "medium",
        question: "Time until disease recurrence follows Exp(0.05) in years. What is the median time to recurrence?",
        options: [
          "ln(2)/0.05 ≈ 13.9 years",
          "1/0.05 = 20 years",
          "0.05 years",
          "2/0.05 = 40 years"
        ],
        correct: 0,
        explanation: "For exponential distribution, median = ln(2)/λ = ln(2)/0.05 ≈ 13.9 years. Note this differs from the mean (1/λ = 20 years).",
        helpLink: "/chapter3/exponential-survival"
      }
    ],

    // Social science version with social research contexts  
    social: [
      {
        id: "ch3-s-q1",
        type: "multiple-choice",
        topic: "3.1 Continuous Variables in Social Science",
        difficulty: "easy", 
        question: "In survey research measuring attitudes on a continuous scale (0-100), what does P(Attitude = 75.0) = 0 represent?",
        options: [
          "No respondent has attitude score 75",
          "Attitude score 75 is impossible",
          "The exact value 75.0 has probability zero in continuous distributions",
          "There's an error in the measurement"
        ],
        correct: 2,
        explanation: "For any continuous random variable, the probability of any single exact value is zero due to the infinite precision of real numbers.",
        helpLink: "/chapter3/continuous-social"
      },

      {
        id: "ch3-s-q2", 
        type: "multiple-choice",
        topic: "3.3 Normal Distribution in Social Research",
        difficulty: "medium",
        question: "IQ scores are normally distributed with mean 100 and standard deviation 15. What percentage of the population has IQ between 85 and 115?",
        options: [
          "50%",
          "68%", 
          "95%",
          "99.7%"
        ],
        correct: 1,
        explanation: "The range 85-115 is 100 ± 15, which is μ ± σ, containing approximately 68% of values in a normal distribution.",
        helpLink: "/chapter3/normal-social"
      },

      {
        id: "ch3-s-q3",
        type: "multiple-choice", 
        topic: "3.4 Exponential in Social Processes",
        difficulty: "medium",
        question: "Time between social media posts follows Exp(0.2) per hour. What's the expected time between posts?",
        options: [
          "0.2 hours",
          "5 hours", 
          "10 hours",
          "50 hours"
        ],
        correct: 1,
        explanation: "For exponential distribution Exp(λ), the mean (expected value) is 1/λ = 1/0.2 = 5 hours.",
        helpLink: "/chapter3/exponential-social"
      }
    ]
  },

  4: {
    title: "Chapter 4: Descriptive Statistics and Sampling Distributions",
    passingScore: 50,
    timeLimit: 35,
    engineering: [
      // 4.1 Central Tendency
      {
        id: "ch4-q1",
        type: "multiple-choice",
        topic: "4.1 Sample Mean vs Sample Median",
        difficulty: "easy",
        question: "A dataset contains values: 15, 16, 18, 18, 20, 20, 21, 22, 23, 75. What is the median?",
        options: [
          "20",
          "20.5", 
          "22.8",
          "24.8"
        ],
        correct: 0,
        explanation: "With 10 values, the median is the average of the 5th and 6th values when sorted: (20 + 20)/2 = 20. The median is robust against the outlier (75).",
        helpLink: "/chapter4/central-tendency"
      },

      {
        id: "ch4-q2",
        type: "multiple-choice",
        topic: "4.1 Mean vs Median Selection",
        difficulty: "medium",
        question: "When should you use the median instead of the mean to report central tendency?",
        options: [
          "When the sample size is small",
          "When the data distribution is symmetric",
          "When the data contains outliers or is heavily skewed",
          "When you need theoretical support"
        ],
        correct: 2,
        explanation: "The median is robust against outliers and provides a better measure of central tendency for skewed distributions.",
        helpLink: "/chapter4/central-tendency"
      },

      {
        id: "ch4-q3",
        type: "multiple-choice",
        topic: "4.1 Quartiles and IQR",
        difficulty: "medium",
        question: "For a dataset with Q₁ = 25, Q₃ = 40, which values would be considered suspected outliers?",
        options: [
          "Values below 2.5 or above 62.5",
          "Values below 10 or above 55",
          "Values below 20 or above 45",
          "Values below 0 or above 65"
        ],
        correct: 0,
        explanation: "Suspected outliers are below Q₁ - 1.5×IQR or above Q₃ + 1.5×IQR. IQR = 40-25 = 15, so outliers are below 25-22.5 = 2.5 or above 40+22.5 = 62.5.",
        helpLink: "/chapter4/variability"
      },

      {
        id: "ch4-q4",
        type: "multi-select",
        topic: "4.1 Dispersion Measures",
        difficulty: "medium",
        question: "Which measures provide information about the spread or variability of data? (Select all that apply)",
        options: [
          "Standard deviation",
          "Mode",
          "Inter-quartile range (IQR)",
          "Range (max - min)"
        ],
        correct: [0, 2, 3],
        explanation: "Standard deviation, IQR, and range all measure spread/variability. Mode is a measure of central tendency, not spread.",
        helpLink: "/chapter4/variability"
      },

      {
        id: "ch4-q5",
        type: "multiple-choice",
        topic: "4.2 Skewness Detection",
        difficulty: "easy",
        question: "In a boxplot, if Q₃ - Q₂ > Q₂ - Q₁, the distribution is:",
        options: [
          "Symmetric",
          "Skewed to the left",
          "Skewed to the right",
          "Cannot determine from this information"
        ],
        correct: 2,
        explanation: "When Q₃ - Q₂ > Q₂ - Q₁, the upper quartile is farther from the median than the lower quartile, indicating right skewness.",
        helpLink: "/chapter4/exploratory-data-analysis"
      },

      {
        id: "ch4-q6",
        type: "multiple-choice",
        topic: "4.2 Histogram Construction",
        difficulty: "medium",
        question: "For a dataset with 64 observations and range = 32, what would be appropriate bin specifications for a histogram?",
        options: [
          "8 bins with width 4",
          "16 bins with width 2", 
          "4 bins with width 8",
          "32 bins with width 1"
        ],
        correct: 0,
        explanation: "The rule of thumb is k ≈ √n bins, so √64 = 8 bins. With range = 32, bin width ≈ 32/8 = 4.",
        helpLink: "/chapter4/exploratory-data-analysis"
      },

      {
        id: "ch4-q7",
        type: "multiple-choice", 
        topic: "4.3 Sample Mean Properties",
        difficulty: "medium",
        question: "If X₁, X₂, ..., X₁₆ are iid with E[Xᵢ] = 50 and Var[Xᵢ] = 16, what are E[X̄] and Var[X̄]?",
        options: [
          "E[X̄] = 50, Var[X̄] = 16",
          "E[X̄] = 50, Var[X̄] = 1", 
          "E[X̄] = 12.5, Var[X̄] = 4",
          "E[X̄] = 800, Var[X̄] = 256"
        ],
        correct: 1,
        explanation: "For sample mean: E[X̄] = μ = 50 and Var[X̄] = σ²/n = 16/16 = 1.",
        helpLink: "/chapter4/sampling-distributions"
      },

      {
        id: "ch4-q8",
        type: "multiple-choice",
        topic: "4.3 Sum of Independent Normal Variables", 
        difficulty: "medium",
        question: "If X₁ ~ N(10, 4) and X₂ ~ N(15, 9) are independent, what is the distribution of X₁ + X₂?",
        options: [
          "N(25, 13)",
          "N(25, 6.5)",
          "N(12.5, 6.5)", 
          "N(25, 3.61)"
        ],
        correct: 0,
        explanation: "For independent normal variables, the sum has mean = 10+15 = 25 and variance = 4+9 = 13, so X₁ + X₂ ~ N(25, 13).",
        helpLink: "/chapter4/sampling-distributions"
      },

      {
        id: "ch4-q9",
        type: "multiple-choice",
        topic: "4.4 Central Limit Theorem",
        difficulty: "easy",
        question: "The Central Limit Theorem states that as sample size increases, the distribution of sample means approaches:",
        options: [
          "The population distribution",
          "An exponential distribution", 
          "A normal distribution",
          "A uniform distribution"
        ],
        correct: 2,
        explanation: "The Central Limit Theorem states that the sampling distribution of the sample mean approaches a normal distribution as n increases.",
        helpLink: "/chapter4/central-limit-theorem"
      },

      {
        id: "ch4-q10",
        type: "multiple-choice",
        topic: "4.4 CLT Application",
        difficulty: "medium", 
        question: "Component lifetimes have mean 100 hours and standard deviation 20 hours. For a sample of 25 components, what is P(X̄ > 105)?",
        options: [
          "P(Z > 1.25)",
          "P(Z > 0.25)",
          "P(Z > 5)",
          "Cannot determine without population distribution"
        ],
        correct: 0,
        explanation: "By CLT, X̄ ~ N(100, 20²/25) = N(100, 16). Standardizing: Z = (105-100)/4 = 1.25, so P(X̄ > 105) = P(Z > 1.25).",
        helpLink: "/chapter4/central-limit-theorem"
      },

      {
        id: "ch4-q11",
        type: "multiple-choice",
        topic: "4.4 CLT with Population Variance Unknown",
        difficulty: "hard",
        question: "A sample of 36 patients gives X̄ = 125 and S = 15. What distribution does (X̄ - μ)/(S/√n) follow?",
        options: [
          "Standard normal N(0,1)",
          "t-distribution with 35 degrees of freedom",
          "t-distribution with 36 degrees of freedom", 
          "Chi-square with 35 degrees of freedom"
        ],
        correct: 1,
        explanation: "When population variance is unknown and estimated by sample variance S, (X̄ - μ)/(S/√n) follows t-distribution with n-1 = 35 degrees of freedom.",
        helpLink: "/chapter4/central-limit-theorem"
      },

      {
        id: "ch4-q12",
        type: "multiple-choice",
        topic: "4.5 Difference Between Two Sample Means",
        difficulty: "medium",
        question: "Two production lines have identical variance σ² = 4. Samples of n₁ = 25 and n₂ = 36 are taken. If the true means are equal, what is the standard deviation of X̄₁ - X̄₂?",
        options: [
          "√(4/25 + 4/36) ≈ 0.493",
          "√(4×25 + 4×36) = 15.62",
          "√(4/61) ≈ 0.256",
          "4"
        ],
        correct: 0,
        explanation: "For difference of sample means: SD(X̄₁ - X̄₂) = √(σ₁²/n₁ + σ₂²/n₂) = √(4/25 + 4/36) ≈ 0.493.",
        helpLink: "/chapter4/sampling-distributions"
      },

      {
        id: "ch4-q13",
        type: "multiple-choice", 
        topic: "4.5 Chi-Square Distribution",
        difficulty: "medium",
        question: "For a sample of size n = 10 from a normal population with variance σ² = 25, what distribution does (n-1)S²/σ² follow?",
        options: [
          "Chi-square with 9 degrees of freedom",
          "Chi-square with 10 degrees of freedom",
          "t-distribution with 9 degrees of freedom", 
          "F-distribution with (9,10) degrees of freedom"
        ],
        correct: 0,
        explanation: "The statistic (n-1)S²/σ² follows a chi-square distribution with n-1 = 9 degrees of freedom when sampling from a normal population.",
        helpLink: "/chapter4/advanced-distributions"
      },

      {
        id: "ch4-q14",
        type: "multiple-choice",
        topic: "4.5 F-Distribution",
        difficulty: "hard", 
        question: "Two independent samples from normal populations give S₁² = 16 (n₁ = 11) and S₂² = 9 (n₂ = 16). If σ₁² = σ₂², what distribution does (S₁²/σ₁²)/(S₂²/σ₂²) follow?",
        options: [
          "F(10, 15)",
          "F(11, 16)", 
          "F(15, 10)",
          "t(25)"
        ],
        correct: 0,
        explanation: "The ratio of sample variances follows F-distribution with degrees of freedom (n₁-1, n₂-1) = (10, 15).",
        helpLink: "/chapter4/advanced-distributions"
      },

      {
        id: "ch4-q15",
        type: "multi-select",
        topic: "4.1 Descriptive Statistics Applications", 
        difficulty: "medium",
        question: "Data analysis finds: mean = 180, median = 175, Q₁ = 160, Q₃ = 190. Which conclusions are valid? (Select all that apply)",
        options: [
          "The distribution is likely right-skewed (mean > median)",
          "The IQR is 30",
          "Values above 235 would be suspected outliers",
          "The data appears normally distributed"
        ],
        correct: [0, 1, 2],
        explanation: "Mean > median suggests right skew. IQR = Q₃ - Q₁ = 30. Outliers are above Q₃ + 1.5×IQR = 190 + 45 = 235.",
        helpLink: "/chapter4/exploratory-data-analysis"
      },

      {
        id: "ch4-q16", 
        type: "multiple-choice",
        topic: "4.4 CLT Practical Application",
        difficulty: "hard",
        question: "Failures follow an unknown distribution with mean 2.5 per month and variance 1.44. For 36 boards monitored over a month, what is P(average failures per board > 3)?",
        options: [
          "Approximately 0.0062",
          "Approximately 0.0228", 
          "Approximately 0.1587",
          "Cannot determine without knowing the distribution"
        ],
        correct: 0,
        explanation: "By CLT, X̄ ~ N(2.5, 1.44/36) = N(2.5, 0.04). P(X̄ > 3) = P(Z > (3-2.5)/0.2) = P(Z > 2.5) ≈ 0.0062.",
        helpLink: "/chapter4/central-limit-theorem"
      },

      {
        id: "ch4-q17",
        type: "multi-select",
        topic: "4.2 Data Visualization Best Practices",
        difficulty: "medium", 
        question: "When creating visualizations for data analysis, which practices improve interpretation? (Select all that apply)",
        options: [
          "Use boxplots to identify outliers and assess symmetry",
          "Choose histogram bin widths to reveal underlying patterns",
          "Include measures of both central tendency and variability",
          "Always prefer pie charts for continuous data"
        ],
        correct: [0, 1, 2],
        explanation: "Boxplots reveal outliers and distribution shape, appropriate binning shows patterns, and both centrality and spread are important. Pie charts are inappropriate for continuous data.",
        helpLink: "/chapter4/exploratory-data-analysis"
      },

      {
        id: "ch4-q18",
        type: "multiple-choice", 
        topic: "4.3 Sampling Distribution Theory",
        difficulty: "hard",
        question: "A manufacturing process has unknown population distribution with μ = 50 and σ = 8. If we take all possible samples of size 16, approximately what percentage of sample means will fall within 2 units of the population mean?",
        options: [
          "68%",
          "95%",
          "99.7%", 
          "Cannot determine without population distribution"
        ],
        correct: 0,
        explanation: "By CLT, X̄ ~ N(50, 8²/16) = N(50, 4). SD(X̄) = 2. Within 2 units means within 1 standard deviation, which is approximately 68%.",
        helpLink: "/chapter4/sampling-distributions"
      }
    ],
    biostats: [],
    social: []
  },

  5: {
    title: "Chapter 5: Estimation",
    passingScore: 50,
    timeLimit: 35,
    engineering: [
      {
        id: "ch5-q1",
        type: "multiple-choice",
        topic: "5.1 Statistical Inference",
        difficulty: "easy",
        question: "What is the primary goal of statistical inference?",
        options: [
          "To calculate exact population parameters",
          "To draw conclusions about a population based on a random sample",
          "To create complex mathematical formulas",
          "To eliminate all uncertainty in data analysis"
        ],
        correct: 1,
        explanation: "Statistical inference aims to draw conclusions about a population based on information gathered from a random sample.",
        helpLink: "/chapter5/statistical-inference"
      },
      {
        id: "ch5-q2",
        type: "multiple-choice",
        topic: "5.1 Point Estimation",
        difficulty: "easy",
        question: "A point estimate is:",
        options: [
          "A range of possible values for a parameter",
          "A single value used to estimate an unknown parameter",
          "The exact value of a population parameter",
          "A confidence interval with zero width"
        ],
        correct: 1,
        explanation: "A point estimate (θ̂) is a single quantity obtained from a statistic that serves as our best guess for an unknown population parameter θ.",
        helpLink: "/chapter5/statistical-inference"
      },
      {
        id: "ch5-q3",
        type: "multiple-choice",
        topic: "5.1 Standard Error",
        difficulty: "medium",
        question: "For a sample of size n from a population with known variance σ², the standard error of the sample mean is:",
        options: [
          "σ²/n",
          "σ/√n",
          "σ/n",
          "σ²/√n"
        ],
        correct: 1,
        explanation: "The standard error of the sample mean is σ/√n, which represents the standard deviation of the sampling distribution of X̄.",
        helpLink: "/chapter5/confidence-intervals-known"
      },
      {
        id: "ch5-q4",
        type: "multi-select",
        topic: "5.1 Statistics Examples",
        difficulty: "medium",
        question: "Which of the following are examples of statistics? (Select all that apply)",
        options: [
          "Sample mean and sample median",
          "Sample variance and standard deviation",
          "Population mean μ",
          "Sample quantiles and order statistics"
        ],
        correct: [0, 1, 3],
        explanation: "Statistics are functions of sample data. Population mean μ is a parameter, not a statistic.",
        helpLink: "/chapter5/statistical-inference"
      },
      {
        id: "ch5-q5",
        type: "multiple-choice",
        topic: "5.2 Confidence Intervals - Known σ",
        difficulty: "medium",
        question: "A 95% confidence interval means that:",
        options: [
          "95% of the sample data falls within the interval",
          "There is a 95% probability the true parameter lies in this specific interval",
          "If we repeated the sampling process many times, about 95% of the intervals would contain the true parameter",
          "95% of all possible sample means fall within the interval"
        ],
        correct: 2,
        explanation: "A 95% confidence interval means that if we repeated the sampling process many times and constructed intervals using the same method, approximately 95% of those intervals would contain the true population parameter.",
        helpLink: "/chapter5/confidence-intervals-known"
      },
      {
        id: "ch5-q6",
        type: "multiple-choice",
        topic: "5.2 68-95-99.7 Rule",
        difficulty: "easy",
        question: "According to the 68-95-99.7 rule, approximately what percentage of values fall within 2 standard deviations of the mean in a normal distribution?",
        options: [
          "68.3%",
          "95.5%",
          "99.7%",
          "90.0%"
        ],
        correct: 1,
        explanation: "The 68-95-99.7 rule states that approximately 95.5% of values fall within 2 standard deviations of the mean.",
        helpLink: "/chapter5/bonus/empirical-rule"
      },
      {
        id: "ch5-q7",
        type: "multiple-choice",
        topic: "5.2 Confidence Intervals - Known σ",
        difficulty: "medium",
        question: "For a 95% confidence interval when σ is known, the critical value z* is:",
        options: [
          "1.645",
          "1.96",
          "2.326",
          "2.575"
        ],
        correct: 1,
        explanation: "For a 95% confidence interval, α = 0.05, so α/2 = 0.025. We need z₀.₀₂₅ = 1.96.",
        helpLink: "/chapter5/confidence-intervals-known"
      },
      {
        id: "ch5-q8",
        type: "multiple-choice",
        topic: "5.2 Confidence Intervals - Known σ",
        difficulty: "hard",
        question: "A sample of 64 observations from a normal population with σ = 72 yields X̄ = 375.2. What is the 95% confidence interval for μ?",
        options: [
          "(357.6, 392.8)",
          "(366.6, 383.8)",
          "(357.56, 392.84)",
          "(348.2, 402.2)"
        ],
        correct: 2,
        explanation: "The 95% CI is X̄ ± z₀.₀₂₅(σ/√n) = 375.2 ± 1.96(72/√64) = 375.2 ± 1.96(9) = 375.2 ± 17.64 = (357.56, 392.84).",
        helpLink: "/chapter5/confidence-intervals-known"
      },
      {
        id: "ch5-q9",
        type: "multi-select",
        topic: "5.2 Confidence Interval Properties",
        difficulty: "medium",
        question: "Which factors make confidence intervals shorter (more precise)? (Select all that apply)",
        options: [
          "Larger sample size n",
          "Smaller population standard deviation σ",
          "Higher confidence level",
          "Lower confidence level"
        ],
        correct: [0, 1, 3],
        explanation: "Confidence intervals become shorter with: larger sample size n, smaller σ, and lower confidence level. Higher confidence level makes intervals wider.",
        helpLink: "/chapter5/confidence-intervals-practice"
      },
      {
        id: "ch5-q10",
        type: "multiple-choice",
        topic: "5.3 Sample Size Determination",
        difficulty: "hard",
        question: "To ensure the estimation error is at most E = 10 with 95% confidence, when σ = 100, the minimum sample size needed is:",
        options: [
          "n ≥ 385",
          "n ≥ 196",
          "n ≥ 39",
          "n ≥ 664"
        ],
        correct: 0,
        explanation: "Using n > (z_{α/2}σ/E)², we get n > (1.96 × 100/10)² = (19.6)² = 384.16, so n ≥ 385.",
        helpLink: "/chapter5/sample-size"
      },
      {
        id: "ch5-q11",
        type: "multiple-choice",
        topic: "5.3 Sample Size Determination",
        difficulty: "medium",
        question: "If we want to reduce the margin of error by half while keeping the same confidence level, the sample size must be:",
        options: [
          "Doubled",
          "Quadrupled",
          "Halved",
          "Increased by √2"
        ],
        correct: 1,
        explanation: "Since the margin of error is proportional to 1/√n, to reduce it by half, we need to increase n by a factor of 4.",
        helpLink: "/chapter5/sample-size"
      },
      {
        id: "ch5-q12",
        type: "multiple-choice",
        topic: "5.4 Confidence Intervals - Unknown σ",
        difficulty: "medium",
        question: "When the population variance is unknown and we use the sample variance S², the appropriate distribution for constructing confidence intervals is:",
        options: [
          "Standard normal distribution",
          "Student t-distribution with n degrees of freedom",
          "Student t-distribution with (n-1) degrees of freedom",
          "Chi-square distribution"
        ],
        correct: 2,
        explanation: "When σ is unknown and estimated by S, the statistic (X̄ - μ)/(S/√n) follows a t-distribution with (n-1) degrees of freedom.",
        helpLink: "/chapter5/confidence-intervals-unknown"
      },
      {
        id: "ch5-q13",
        type: "multiple-choice",
        topic: "5.4 t-Distribution Properties",
        difficulty: "medium",
        question: "Compared to the standard normal distribution, the t-distribution is:",
        options: [
          "More peaked with thinner tails",
          "Less peaked with thicker tails",
          "Identical in shape",
          "Skewed to the right"
        ],
        correct: 1,
        explanation: "The t-distribution is less peaked and has thicker tails than the standard normal distribution.",
        helpLink: "/chapter5/confidence-intervals-unknown"
      },
      {
        id: "ch5-q14",
        type: "multiple-choice",
        topic: "5.4 Confidence Intervals - Unknown σ",
        difficulty: "hard",
        question: "For data with n = 9, X̄ = 5.01, and S = 0.97, what is the 95% confidence interval for μ when σ is unknown?",
        options: [
          "(4.29, 5.73)",
          "(4.26, 5.76)",
          "(4.32, 5.70)",
          "(4.01, 6.01)"
        ],
        correct: 1,
        explanation: "Using the t-distribution with df = 8, t₀.₀₂₅(8) = 2.306. The CI is 5.01 ± 2.306(0.97/√9) = 5.01 ± 0.75 = (4.26, 5.76).",
        helpLink: "/chapter5/confidence-intervals-unknown"
      },
      {
        id: "ch5-q15",
        type: "multi-select",
        topic: "5.4 Known vs Unknown Variance",
        difficulty: "medium",
        question: "When comparing confidence intervals for the same data, which statements are true? (Select all that apply)",
        options: [
          "Intervals are wider when σ is unknown than when σ is known",
          "t-critical values are larger than z-critical values for the same confidence level",
          "The difference between t and z intervals decreases as sample size increases",
          "Unknown variance always leads to narrower intervals"
        ],
        correct: [0, 1, 2],
        explanation: "When σ is unknown: intervals are wider, t-critical values are larger than z-critical values, and as n increases, t-distribution approaches standard normal.",
        helpLink: "/chapter5/confidence-intervals-unknown"
      },
      {
        id: "ch5-q16",
        type: "multiple-choice",
        topic: "5.5 Confidence Intervals for Proportions",
        difficulty: "medium",
        question: "For a binomial proportion with n trials and X successes, the point estimator for p is:",
        options: [
          "X",
          "X/n",
          "n/X",
          "√(X/n)"
        ],
        correct: 1,
        explanation: "The point estimator for the population proportion p is P̂ = X/n, where X is the number of successes in n trials.",
        helpLink: "/chapter5/proportions"
      },
      {
        id: "ch5-q17",
        type: "multiple-choice",
        topic: "5.5 Confidence Intervals for Proportions",
        difficulty: "hard",
        question: "In a poll of 1000 voters, 520 support candidate A. What is the approximate 95% confidence interval for the true proportion supporting A?",
        options: [
          "(0.489, 0.551)",
          "(0.495, 0.545)",
          "(0.485, 0.555)",
          "(0.500, 0.540)"
        ],
        correct: 0,
        explanation: "P̂ = 520/1000 = 0.52. The 95% CI is 0.52 ± 1.96√[0.52(0.48)/1000] = 0.52 ± 1.96(0.0158) = 0.52 ± 0.031 = (0.489, 0.551).",
        helpLink: "/chapter5/proportions"
      },
      {
        id: "ch5-q18",
        type: "multiple-choice",
        topic: "5.5 Interpreting Proportion Intervals",
        difficulty: "hard",
        question: "Two candidates have poll results: A: 52% ± 3.1%, B: 48% ± 3.1%. A newspaper headline reads 'Candidate A Leads!' Is this warranted?",
        options: [
          "Yes, A clearly leads by 4 percentage points",
          "No, the confidence intervals overlap significantly",
          "Yes, the margin of error is small enough",
          "No, but only because the sample size was too small"
        ],
        correct: 1,
        explanation: "A's interval: (48.9%, 55.1%) and B's interval: (44.9%, 51.1%) overlap substantially (48.9% to 51.1%), suggesting the race could be much closer.",
        helpLink: "/chapter5/bonus/ci-interpretation"
      }
    ],
    biostats: [],
    social: []
  },

  6: {
    title: "Chapter 6: Hypothesis Testing",
    passingScore: 50,
    timeLimit: 40,
    engineering: [
      // 6.1 Hypothesis Testing Fundamentals
      {
        id: "ch6-q1",
        type: "multiple-choice",
        topic: "6.1 Hypothesis Testing Fundamentals",
        difficulty: "easy",
        question: "A pharmaceutical company claims their new drug is more effective than the current standard treatment. What should be the null hypothesis for testing this claim?",
        options: [
          "H₀: The new drug is more effective than standard treatment",
          "H₀: The new drug is equally effective as standard treatment",
          "H₀: The new drug is less effective than standard treatment",
          "H₀: There is no difference in effectiveness between treatments"
        ],
        correct: 3,
        explanation: "The null hypothesis should represent no effect or no difference. In hypothesis testing, we start by assuming there's no difference and require strong evidence to reject this assumption.",
        helpLink: "/chapter6/hypothesis-fundamentals"
      },

      {
        id: "ch6-q2", 
        type: "multi-select",
        topic: "6.1 Type I and Type II Errors",
        difficulty: "medium",
        question: "In medical testing, a Type I error would mean approving an ineffective drug, while a Type II error would mean rejecting an effective drug. Which statements are correct? (Select all that apply)",
        options: [
          "Type I error probability is denoted by α",
          "Type II error probability is denoted by β", 
          "Power of the test equals 1 - β",
          "We can make both Type I and Type II errors simultaneously"
        ],
        correct: [0, 1, 2],
        explanation: "α represents P(Type I error), β represents P(Type II error), and power = 1-β. We cannot make both errors simultaneously since they are mutually exclusive outcomes.",
        helpLink: "/chapter6/error-types"
      },

      {
        id: "ch6-q3",
        type: "multiple-choice", 
        topic: "6.2 Types of Alternative Hypotheses",
        difficulty: "easy",
        question: "An engineer wants to test if the mean strength of steel cables exceeds 5000 PSI. Which alternative hypothesis is appropriate?",
        options: [
          "H₁: μ = 5000",
          "H₁: μ ≠ 5000", 
          "H₁: μ > 5000",
          "H₁: μ < 5000"
        ],
        correct: 2,
        explanation: "Since we want to test if strength 'exceeds' 5000 PSI, we use a right-sided (one-tailed) test: H₁: μ > 5000.",
        helpLink: "/chapter6/alternative-hypotheses"
      },

      {
        id: "ch6-q4",
        type: "multiple-choice",
        topic: "6.3 P-values and Significance",
        difficulty: "medium", 
        question: "A quality control test yields a p-value of 0.03. Using α = 0.05, what is the correct interpretation?",
        options: [
          "Accept the null hypothesis",
          "Reject the null hypothesis",
          "The test is inconclusive",
          "Increase the sample size"
        ],
        correct: 1,
        explanation: "Since p-value (0.03) < α (0.05), we reject the null hypothesis. The evidence against H₀ is statistically significant at the 5% level.",
        helpLink: "/chapter6/p-values"
      },

      {
        id: "ch6-q5",
        type: "multiple-choice",
        topic: "6.4 Z-test for Mean (Known Variance)",
        difficulty: "medium",
        question: "A machine produces bolts with known standard deviation σ = 2mm. A sample of 36 bolts has mean diameter 10.5mm. Testing H₀: μ = 10 vs H₁: μ ≠ 10, what is the test statistic?",
        options: [
          "z = 1.5",
          "z = 0.75",
          "z = 3.0", 
          "z = 0.25"
        ],
        correct: 0,
        explanation: "Test statistic z = (x̄ - μ₀)/(σ/√n) = (10.5 - 10)/(2/√36) = 0.5/(2/6) = 0.5/0.333 = 1.5",
        helpLink: "/chapter6/z-test"
      },

      {
        id: "ch6-q6",
        type: "multiple-choice",
        topic: "6.4 Critical Regions",
        difficulty: "hard",
        question: "For a two-tailed test with α = 0.01, what are the critical values for rejecting H₀?",
        options: [
          "z < -1.96 or z > 1.96",
          "z < -2.33 or z > 2.33", 
          "z < -2.58 or z > 2.58",
          "z < -1.65 or z > 1.65"
        ],
        correct: 2,
        explanation: "For α = 0.01 in a two-tailed test, we need α/2 = 0.005 in each tail. The critical values are ±z₀.₀₀₅ = ±2.58.",
        helpLink: "/chapter6/critical-regions"
      },

      {
        id: "ch6-q7",
        type: "multiple-choice",
        topic: "6.5 T-test for Mean (Unknown Variance)", 
        difficulty: "medium",
        question: "A sample of 16 measurements has mean 25.3 and standard deviation 3.2. Testing H₀: μ = 24 vs H₁: μ > 24, which distribution should be used?",
        options: [
          "Standard normal (Z)",
          "t-distribution with 15 degrees of freedom",
          "t-distribution with 16 degrees of freedom", 
          "Chi-square distribution"
        ],
        correct: 1,
        explanation: "Since σ is unknown and estimated by s, we use t-distribution with n-1 = 16-1 = 15 degrees of freedom.",
        helpLink: "/chapter6/t-test"
      },

      {
        id: "ch6-q8",
        type: "multi-select",
        topic: "6.6 Test for Proportions",
        difficulty: "medium",
        question: "A survey claims 60% of engineers prefer remote work. In a sample of 200 engineers, 135 prefer remote work. Which conditions must be met for a valid proportion test? (Select all that apply)",
        options: [
          "np₀ ≥ 5 and n(1-p₀) ≥ 5",
          "Sample size n ≥ 30",
          "Population is at least 10 times larger than sample",
          "Sample proportion p̂ = 135/200 = 0.675"
        ],
        correct: [0, 2, 3], 
        explanation: "For proportion tests: (1) np₀ ≥ 5 and n(1-p₀) ≥ 5 for normal approximation, (2) population should be ≥10n for independence, (3) p̂ = 135/200 = 0.675 is correct. The n ≥ 30 rule applies to means, not proportions.",
        helpLink: "/chapter6/proportion-test"
      },

      {
        id: "ch6-q9",
        type: "multiple-choice",
        topic: "6.7 Paired Two-Sample Test",
        difficulty: "medium", 
        question: "A study measures blood pressure before and after medication in 10 patients. What type of test should be used to determine if the medication is effective?",
        options: [
          "Two-sample t-test assuming equal variances",
          "Two-sample t-test assuming unequal variances",
          "Paired t-test on the differences",
          "Two-sample z-test"
        ],
        correct: 2,
        explanation: "Since measurements are taken on the same patients before and after treatment, the samples are paired (dependent). Use a paired t-test on the differences d = after - before.",
        helpLink: "/chapter6/paired-test"
      },

      {
        id: "ch6-q10",
        type: "multiple-choice",
        topic: "6.8 Two-Sample Test (Independent Groups)",
        difficulty: "hard",
        question: "Comparing mean salaries between two companies: Company A (n₁=50, x̄₁=75000, s₁=8000) and Company B (n₂=45, x̄₂=72000, s₂=7500). Both sample sizes are large. What test statistic should be calculated?",
        options: [
          "z = (x̄₁ - x̄₂)/√(s₁²/n₁ + s₂²/n₂)",
          "t = (x̄₁ - x̄₂)/sp√(1/n₁ + 1/n₂)", 
          "z = (x̄₁ - x̄₂)/(s₁ + s₂)",
          "t = (x̄₁ - x̄₂)/(s₁ - s₂)"
        ],
        correct: 0,
        explanation: "For large samples with unknown but potentially unequal variances, use z = (x̄₁ - x̄₂)/√(s₁²/n₁ + s₂²/n₂). The normal approximation applies due to large sample sizes.",
        helpLink: "/chapter6/two-sample-test"
      },

      {
        id: "ch6-q11", 
        type: "multiple-choice",
        topic: "6.9 Difference of Two Proportions",
        difficulty: "hard",
        question: "Testing if vaccination rates differ between two cities: City A (250 out of 400 vaccinated) and City B (180 out of 300 vaccinated). What is the pooled proportion p̂?",
        options: [
          "p̂ = 0.614",
          "p̂ = 0.625",
          "p̂ = 0.600", 
          "p̂ = 0.650"
        ],
        correct: 0,
        explanation: "Pooled proportion p̂ = (x₁ + x₂)/(n₁ + n₂) = (250 + 180)/(400 + 300) = 430/700 = 0.614",
        helpLink: "/chapter6/two-proportions"
      },

      {
        id: "ch6-q12",
        type: "multiple-choice",
        topic: "6.1 Power of a Test",
        difficulty: "hard", 
        question: "If the probability of Type II error is β = 0.20, what is the power of the test?",
        options: [
          "0.20",
          "0.80", 
          "0.05",
          "0.95"
        ],
        correct: 1,
        explanation: "Power = 1 - β = 1 - 0.20 = 0.80. Power is the probability of correctly rejecting a false null hypothesis.",
        helpLink: "/chapter6/power-test"
      },

      {
        id: "ch6-q13",
        type: "multi-select",
        topic: "6.3 Test Statistics and Critical Regions", 
        difficulty: "medium",
        question: "Which factors affect the power of a hypothesis test? (Select all that apply)",
        options: [
          "Sample size (n)",
          "Significance level (α)", 
          "Confidence level (1 - α)",
          "Effect size (difference from H₀)"
        ],
        correct: [0, 1, 3],
        explanation: "Statements 1, 2, and 4 affect power. Statement 3 is redundant with statement 2 (confidence level = 1 - α), and stating it this way is misleading since higher confidence means lower α, which decreases power.",
        helpLink: "/chapter6/power-factors"
      },

      {
        id: "ch6-q14",
        type: "multiple-choice",
        topic: "6.4 One-tailed vs Two-tailed Tests",
        difficulty: "medium",
        question: "A researcher suspects a new teaching method increases test scores but isn't sure if it might decrease them. The current average is 75. Which hypotheses are appropriate?",
        options: [
          "H₀: μ = 75, H₁: μ > 75",
          "H₀: μ = 75, H₁: μ < 75", 
          "H₀: μ = 75, H₁: μ ≠ 75",
          "H₀: μ ≠ 75, H₁: μ = 75"
        ],
        correct: 2,
        explanation: "Since the researcher is unsure of the direction of change, use a two-tailed test: H₀: μ = 75 vs H₁: μ ≠ 75.",
        helpLink: "/chapter6/one-two-tailed"
      },

      {
        id: "ch6-q15", 
        type: "multiple-choice",
        topic: "6.5 Interpretation of Results",
        difficulty: "easy",
        question: "After conducting a hypothesis test, you fail to reject H₀. What can you conclude?",
        options: [
          "H₀ is true",
          "H₁ is false",
          "There is insufficient evidence to support H₁", 
          "The test was conducted incorrectly"
        ],
        correct: 2,
        explanation: "Failing to reject H₀ means there's insufficient evidence against it, not that H₀ is proven true. We never 'accept' H₀, only fail to reject it.",
        helpLink: "/chapter6/interpretation"
      },

      {
        id: "ch6-q16",
        type: "multiple-choice", 
        topic: "6.6 Real-world Applications",
        difficulty: "medium",
        question: "A pharmaceutical company tests a new drug on 100 patients. The p-value is 0.048. Using α = 0.05, what should the company conclude about drug approval?",
        options: [
          "Approve the drug immediately",
          "The drug shows statistically significant results and warrants further investigation",
          "The drug is ineffective", 
          "Increase the sample size to 200 patients"
        ],
        correct: 1,
        explanation: "With p-value (0.048) < α (0.05), the results are statistically significant. However, statistical significance doesn't automatically mean practical significance or immediate approval - further investigation is warranted.",
        helpLink: "/chapter6/real-world-applications"
      },

      {
        id: "ch6-q17",
        type: "multi-select",
        topic: "6.8 Assumptions for T-tests", 
        difficulty: "hard",
        question: "Which assumptions are required for a two-sample t-test? (Select all that apply)",
        options: [
          "Both populations are normally distributed",
          "Both samples are independent", 
          "Population variances are known",
          "Sample sizes are equal"
        ],
        correct: [0, 1],
        explanation: "T-tests require normality and independence. Population variances are unknown (that's why we use t instead of z), and sample sizes don't need to be equal.",
        helpLink: "/chapter6/t-test-assumptions"
      },

      {
        id: "ch6-q18",
        type: "multiple-choice",
        topic: "6.9 Effect Size vs Statistical Significance", 
        difficulty: "hard",
        question: "A study with n=10,000 finds that Brand A batteries last 0.5 hours longer than Brand B (p < 0.001). What can we conclude?",
        options: [
          "Brand A is practically much better than Brand B",
          "The difference is statistically significant but may not be practically meaningful", 
          "The study is flawed due to large sample size",
          "Brand B is inferior and should be discontinued"
        ],
        correct: 1,
        explanation: "Large sample sizes can make small differences statistically significant. A 0.5-hour difference might not be practically meaningful despite being highly significant (p < 0.001).",
        helpLink: "/chapter6/effect-size"
      }
    ]
  },

  7: {
    title: "Chapter 7: Linear Regression and Correlation",
    passingScore: 50,
    timeLimit: 35,
    engineering: [
      {
        id: "ch7-q1",
        type: "multiple-choice",
        topic: "7.1 Correlation Coefficient",
        difficulty: "easy",
        question: "The sample correlation coefficient ρXY measures:",
        options: [
          "Only the strength of a linear relationship between X and Y",
          "The strength and direction of a linear relationship between X and Y", 
          "The causal relationship between X and Y",
          "Only positive relationships between X and Y"
        ],
        correct: 1,
        explanation: "The correlation coefficient ρXY measures both the strength and direction of the linear relationship between two variables.",
        helpLink: "/chapter7/correlation-coefficient"
      },

      {
        id: "ch7-q2", 
        type: "multiple-choice",
        topic: "7.1 Correlation Coefficient",
        difficulty: "easy",
        question: "What is the range of possible values for the correlation coefficient ρXY?",
        options: [
          "0 ≤ ρXY ≤ 1",
          "-∞ < ρXY < ∞", 
          "-1 ≤ ρXY ≤ 1",
          "ρXY > 0"
        ],
        correct: 2,
        explanation: "The correlation coefficient always lies between -1 and 1, inclusive. Values of -1 indicate perfect negative correlation, +1 indicates perfect positive correlation, and 0 indicates no linear correlation.",
        helpLink: "/chapter7/correlation-coefficient"
      },

      {
        id: "ch7-q3",
        type: "multiple-choice", 
        topic: "7.1 Correlation Coefficient",
        difficulty: "medium",
        question: "A dataset shows height (cm) and weight (kg) for 25 students. If all heights are converted from cm to inches (multiplied by 0.394), what happens to the correlation coefficient?",
        options: [
          "It increases proportionally",
          "It decreases proportionally", 
          "It remains unchanged",
          "It becomes negative"
        ],
        correct: 2,
        explanation: "The correlation coefficient is unaffected by changes of scale or origin. Multiplying variables by constants changes both numerator and denominator equally, leaving ρXY unchanged.",
        helpLink: "/chapter7/correlation-coefficient"
      },

      {
        id: "ch7-q4",
        type: "multi-select",
        topic: "7.1 Correlation Coefficient", 
        difficulty: "medium",
        question: "Which statements about correlation are correct? (Select all that apply)",
        options: [
          "High correlation implies causation",
          "Correlation can detect non-linear relationships effectively",
          "ρXY = ρYX (correlation is symmetric)",
          "Strong non-linear relationships may show weak correlation"
        ],
        correct: [2, 3],
        explanation: "Correlation is symmetric (ρXY = ρYX) and may not detect strong non-linear relationships well. High correlation does not imply causation, and correlation specifically measures linear relationships.",
        helpLink: "/chapter7/correlation-coefficient"
      },

      {
        id: "ch7-q5",
        type: "multiple-choice",
        topic: "7.2 Simple Linear Regression",
        difficulty: "easy", 
        question: "In the simple linear regression model Y = β₀ + β₁X + ε, what does β₁ represent?",
        options: [
          "The y-intercept of the regression line",
          "The slope of the regression line",
          "The error variance", 
          "The correlation coefficient"
        ],
        correct: 1,
        explanation: "In the linear regression model, β₁ is the slope parameter, representing the change in Y for a one-unit increase in X. β₀ is the intercept.",
        helpLink: "/chapter7/simple-linear-regression"
      },

      {
        id: "ch7-q6",
        type: "multiple-choice",
        topic: "7.2 Simple Linear Regression",
        difficulty: "medium",
        question: "The least squares estimators b₀ and b₁ are found by minimizing:",
        options: [
          "The sum of residuals Σ(yi - ŷi)",
          "The sum of squared residuals Σ(yi - ŷi)²", 
          "The correlation coefficient",
          "The mean squared error only"
        ],
        correct: 1,
        explanation: "The least squares method finds estimators by minimizing the Sum of Squared Errors (SSE) = Σ(yi - ŷi)², where ŷi are the fitted values.",
        helpLink: "/chapter7/simple-linear-regression"
      },

      {
        id: "ch7-q7",
        type: "multiple-choice",
        topic: "7.2 Simple Linear Regression", 
        difficulty: "medium",
        question: "For a fuel efficiency study, the regression line is ŷ = 74.28 + 14.95x, where x is hydrocarbon level and y is oxygen level. What is the predicted oxygen level when hydrocarbon level is 1.5?",
        options: [
          "89.71",
          "96.71",
          "91.71", 
          "82.71"
        ],
        correct: 1,
        explanation: "Substituting x = 1.5 into the equation: ŷ = 74.28 + 14.95(1.5) = 74.28 + 22.425 = 96.705 ≈ 96.71.",
        helpLink: "/chapter7/simple-linear-regression"
      },

      {
        id: "ch7-q8", 
        type: "multiple-choice",
        topic: "7.2 Simple Linear Regression",
        difficulty: "hard",
        question: "Why does the estimated error variance σ̂² use n-2 degrees of freedom instead of n-1?",
        options: [
          "Because we're working with paired data",
          "Because two parameters (β₀, β₁) were estimated from the data",
          "Because we use the sample variance formula",
          "Because of the normality assumption"
        ],
        correct: 1,
        explanation: "The MSE uses n-2 degrees of freedom because two parameters (intercept β₀ and slope β₁) had to be estimated from the data to obtain the fitted values ŷi.",
        helpLink: "/chapter7/simple-linear-regression"
      },

      {
        id: "ch7-q9",
        type: "multiple-choice",
        topic: "7.3 Hypothesis Testing in Regression",
        difficulty: "medium",
        question: "To test the significance of regression (H₀: β₁ = 0 vs H₁: β₁ ≠ 0), we use a test statistic that follows:",
        options: [
          "Normal distribution N(0,1)",
          "Chi-square distribution with 1 df", 
          "t-distribution with n-2 df",
          "F-distribution with 1 and n-1 df"
        ],
        correct: 2,
        explanation: "The test statistic T₀ = (b₁ - 0)/√(σ̂²/Sxx) follows a t-distribution with n-2 degrees of freedom when testing the significance of the slope.",
        helpLink: "/chapter7/hypothesis-testing-regression"
      },

      {
        id: "ch7-q10",
        type: "multi-select", 
        topic: "7.3 Hypothesis Testing in Regression",
        difficulty: "hard",
        question: "In hypothesis testing for linear regression, which tests can be performed? (Select all that apply)",
        options: [
          "Test if the intercept β₀ equals a specific value",
          "Test if the slope β₁ equals a specific value", 
          "Test the significance of regression (β₁ = 0)",
          "Test if the error variance σ² equals a specific value"
        ],
        correct: [0, 1, 2],
        explanation: "We can test hypotheses about the intercept, slope, and significance of regression. While we estimate σ², testing specific values for error variance is not typically covered in simple linear regression.",
        helpLink: "/chapter7/hypothesis-testing-regression"
      },

      {
        id: "ch7-q11",
        type: "multiple-choice",
        topic: "7.4 Confidence and Prediction Intervals", 
        difficulty: "medium",
        question: "What is the main difference between a confidence interval for the mean response and a prediction interval for a new observation?",
        options: [
          "They use different confidence levels",
          "Prediction intervals are wider because they account for individual variation",
          "Confidence intervals are always more accurate", 
          "They use different regression equations"
        ],
        correct: 1,
        explanation: "Prediction intervals are wider than confidence intervals because they account for both the uncertainty in estimating the mean response AND the individual variation around that mean.",
        helpLink: "/chapter7/confidence-prediction-intervals"
      },

      {
        id: "ch7-q12",
        type: "multiple-choice",
        topic: "7.4 Confidence and Prediction Intervals",
        difficulty: "hard", 
        question: "For prediction intervals at x₀, the variance includes the term [1 + 1/n + (x₀-x̄)²/Sxx]. Why is the '1' term included?",
        options: [
          "To account for the sample size",
          "To account for individual observation variation around the mean",
          "To account for estimation of the intercept",
          "To account for the correlation structure"
        ],
        correct: 1,
        explanation: "The '1' term accounts for the individual variation of a new observation around its predicted mean. This is why prediction intervals are wider than confidence intervals.",
        helpLink: "/chapter7/confidence-prediction-intervals"
      },

      {
        id: "ch7-q13",
        type: "multiple-choice",
        topic: "7.5 Analysis of Variance (ANOVA)",
        difficulty: "medium",
        question: "In the ANOVA table for regression, what does SSR (Sum of Squares Regression) measure?",
        options: [
          "Variation explained by the regression model",
          "Variation not explained by the model", 
          "Total variation in the response",
          "Variation due to experimental error"
        ],
        correct: 0,
        explanation: "SSR = Σ(ŷi - ȳ)² measures the variation in the response that is explained by the regression model.",
        helpLink: "/chapter7/analysis-of-variance"
      },

      {
        id: "ch7-q14",
        type: "multiple-choice", 
        topic: "7.5 Analysis of Variance (ANOVA)",
        difficulty: "hard",
        question: "In ANOVA for regression, the F-statistic F* = MSR/MSE follows which distribution under H₀: β₁ = 0?",
        options: [
          "F(1, n-1)",
          "F(1, n-2)",
          "F(2, n-2)", 
          "F(n-1, 1)"
        ],
        correct: 1,
        explanation: "The F-statistic follows an F-distribution with 1 degree of freedom in the numerator (for one regression parameter β₁) and n-2 degrees of freedom in the denominator.",
        helpLink: "/chapter7/analysis-of-variance"
      },

      {
        id: "ch7-q15",
        type: "multiple-choice",
        topic: "7.6 Coefficient of Determination",
        difficulty: "easy",
        question: "The coefficient of determination R² = 0.85 means:",
        options: [
          "85% correlation between X and Y",
          "85% of the variation in Y is explained by the regression model", 
          "The regression model is 85% accurate",
          "There's an 85% chance the model is correct"
        ],
        correct: 1,
        explanation: "R² represents the proportion of variability in the response variable that is explained by the fitted regression model.",
        helpLink: "/chapter7/coefficient-of-determination"
      },

      {
        id: "ch7-q16",
        type: "multiple-choice",
        topic: "7.6 Coefficient of Determination", 
        difficulty: "medium",
        question: "Which formula correctly represents the coefficient of determination?",
        options: [
          "R² = SSR/SST",
          "R² = 1 - SSE/SST", 
          "R² = SSE/SSR",
          "Both A and B are correct"
        ],
        correct: 3,
        explanation: "Both formulas are equivalent: R² = SSR/SST = 1 - SSE/SST. Since SST = SSR + SSE, both expressions give the same result.",
        helpLink: "/chapter7/coefficient-of-determination"
      },

      {
        id: "ch7-q17",
        type: "multi-select",
        topic: "7.6 Coefficient of Determination",
        difficulty: "medium", 
        question: "What are important considerations about R²? (Select all that apply)",
        options: [
          "R² always lies between 0 and 1",
          "Higher R² always means a better model",
          "R² can be affected by sample size", 
          "R² = 1 indicates perfect fit"
        ],
        correct: [0, 2, 3],
        explanation: "R² ranges from 0 to 1, can be affected by factors like sample size, and R² = 1 indicates perfect fit. However, higher R² doesn't always mean a better model due to overfitting.",
        helpLink: "/chapter7/coefficient-of-determination"
      },

      {
        id: "ch7-q18",
        type: "multiple-choice",
        topic: "7.2 Simple Linear Regression",
        difficulty: "hard",
        question: "A researcher studying crime statistics finds the regression line ŷ = 51.27 + 15.34x, where x is murders per 100,000 and y is assaults per 100,000. If a state has 12 murders per 100,000, what's the predicted number of assaults per 100,000?",
        options: [
          "199.35",
          "235.35", 
          "215.35",
          "184.08"
        ],
        correct: 1,
        explanation: "Substituting x = 12: ŷ = 51.27 + 15.34(12) = 51.27 + 184.08 = 235.35 assaults per 100,000 residents.",
        helpLink: "/chapter7/simple-linear-regression"
      }
    ],
    biostats: [],
    social: []
  }
};

// Helper function to get questions for a specific chapter and version
export function getChapterQuestions(chapter, version = 'engineering') {
  const chapterData = chapterQuestions[chapter];
  if (!chapterData) return null;
  
  // Get the questions for the requested version
  const versionQuestions = chapterData[version];
  
  // Use the version questions if they exist and are not empty
  // Otherwise fallback to engineering version
  const questions = (versionQuestions && versionQuestions.length > 0) 
    ? versionQuestions 
    : chapterData.engineering;
  
  return {
    ...chapterData,
    questions
  };
}

// Helper to shuffle questions for randomized order (optional)
export function shuffleQuestions(questions) {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}