# Goals
Right now this application is just a series of cool demos. I want to turn this into a platform for learning probability in a new approach.

Each section will have a series of follow up questions.
(1) Questions access the student's conceptual understanding (i.e., explain this idea to an LLM). To build this feature are are going to learn a lot more about:
- How to verify if can LLM can solve math problems
- Guardrails on LLMs (make sure the students don't try to give something to the LLM that is not relevant to the question)
- How to grade the students response
- How to provide feedback to the student based on their response

I think iteratively trying to explain a concept, getting feedback from a tutor about what you do understand and what you're not getting, and asking the student to explain again/add more details to their explanation is a powerful idea that we want to implement.

(2) Multiple Choice Quizzes (based on Brilliant's Wikis). The goal of the multiple choice questions is to test the student's ability to do computations. We also want the functionality that if the student gives up or chooses to reveal the answer, they can 'reveal' a fully worked out solution.

We want to be able to track students progress in each page, each section, and the overall course. Progress is entirely based these questions.

---
## From Concepts to Components
These are the things we want to do at a conceptual level. And I'm sure there will be other features I will want to add. However, at a practical level these ideas need to implemented via code, and do be honest I don't know what the best way to accomplish this is.

1) I think I need to think hard about the over all architecture of the applicaiton. There is so much already that has been done. Rather than attempting to tackle refactoring exisitng compoents, perhaps its useful to think about the optimal way design the new compoents.


---
# Thinking In React
1) Break the UI into component hierarchy.
2) Build a static version in React.
  - most straight forward approach is to build static version that renders the UI and add interactivity later.
  - to build a static version, we'll want to build componets that reuse other componet and pass data using props.
