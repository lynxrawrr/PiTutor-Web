import { assign, setup } from "xstate";

export type QuizContext = {
  categoryId: string | null;
  answers: Record<string, string>;
  score: number | null;
  error: string | null;
};

export type QuizEvent =
  | { type: "SELECT_CATEGORY"; categoryId: string }
  | { type: "LOAD_SUCCESS" }
  | { type: "LOAD_FAILED"; error?: string }
  | { type: "ANSWER_QUESTION"; questionId: string; optionId: string }
  | { type: "REVIEW" }
  | { type: "SUBMIT" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_FAILED"; error?: string }
  | { type: "CALCULATE_DONE"; score: number }
  | { type: "VIEW_DISCUSSION" }
  | { type: "RETAKE" }
  | { type: "BACK" };

export const quizMachine = setup({
  types: {} as {
    context: QuizContext;
    events: QuizEvent;
  },
  actions: {
    setCategory: assign({
      categoryId: ({ event }) =>
        event.type === "SELECT_CATEGORY" ? event.categoryId : null,
      answers: {},
      score: null,
      error: null,
    }),
    setAnswer: assign({
      answers: ({ context, event }) => {
        if (event.type !== "ANSWER_QUESTION") {
          return context.answers;
        }

        return {
          ...context.answers,
          [event.questionId]: event.optionId,
        };
      },
    }),
    setScore: assign({
      score: ({ event }) => (event.type === "CALCULATE_DONE" ? event.score : null),
    }),
    setError: assign({
      error: ({ event }) =>
        "error" in event && event.error ? event.error : "Kuis gagal diproses.",
    }),
    resetAttempt: assign({
      answers: {},
      score: null,
      error: null,
    }),
  },
}).createMachine({
  id: "quiz",
  initial: "selectingCategory",
  context: {
    categoryId: null,
    answers: {},
    score: null,
    error: null,
  },
  states: {
    selectingCategory: {
      on: {
        SELECT_CATEGORY: { target: "loadingQuestions", actions: "setCategory" },
      },
    },
    loadingQuestions: {
      on: {
        LOAD_SUCCESS: "answering",
        LOAD_FAILED: { target: "selectingCategory", actions: "setError" },
      },
    },
    answering: {
      on: {
        ANSWER_QUESTION: { actions: "setAnswer" },
        REVIEW: "reviewingAnswers",
        BACK: "selectingCategory",
      },
    },
    reviewingAnswers: {
      on: {
        SUBMIT: "submitting",
        BACK: "answering",
      },
    },
    submitting: {
      on: {
        SUBMIT_SUCCESS: "calculatingScore",
        SUBMIT_FAILED: { target: "reviewingAnswers", actions: "setError" },
      },
    },
    calculatingScore: {
      on: {
        CALCULATE_DONE: { target: "showingResult", actions: "setScore" },
      },
    },
    showingResult: {
      on: {
        VIEW_DISCUSSION: "showingDiscussion",
        RETAKE: { target: "loadingQuestions", actions: "resetAttempt" },
      },
    },
    showingDiscussion: {
      on: {
        RETAKE: { target: "loadingQuestions", actions: "resetAttempt" },
        BACK: "showingResult",
      },
    },
  },
});
