import { assign, setup } from "xstate";

export type CourseLearningContext = {
  selectedLessonId: string | null;
  error: string | null;
};

export type CourseLearningEvent =
  | { type: "ENROLL" }
  | { type: "ENROLL_SUCCESS" }
  | { type: "ENROLL_FAILED"; error?: string }
  | { type: "CONTINUE_LEARNING" }
  | { type: "SELECT_LESSON"; lessonId: string }
  | { type: "VIDEO_READY" }
  | { type: "VIDEO_ERROR"; error?: string }
  | { type: "MARK_COMPLETE" }
  | { type: "SAVE_SUCCESS" }
  | { type: "SAVE_FAILED"; error?: string }
  | { type: "COURSE_COMPLETED" }
  | { type: "MORE_LESSONS_AVAILABLE" }
  | { type: "SUBMIT_RATING" }
  | { type: "RATING_SUCCESS" }
  | { type: "RATING_FAILED"; error?: string }
  | { type: "BACK_TO_COURSE" }
  | { type: "BACK_TO_LESSONS" }
  | { type: "RETRY" }
  | { type: "NEXT_LESSON"; lessonId?: string };

export const courseLearningMachine = setup({
  types: {} as {
    context: CourseLearningContext;
    events: CourseLearningEvent;
  },
  actions: {
    clearError: assign({ error: null }),
    setError: assign({
      error: ({ event }) =>
        "error" in event && event.error ? event.error : "Terjadi kesalahan.",
    }),
    setSelectedLesson: assign({
      selectedLessonId: ({ context, event }) => {
        if (event.type === "SELECT_LESSON") {
          return event.lessonId;
        }

        if (event.type === "NEXT_LESSON" && event.lessonId) {
          return event.lessonId;
        }

        return context.selectedLessonId;
      },
    }),
  },
}).createMachine({
  id: "courseLearning",
  initial: "courseOverview",
  context: {
    selectedLessonId: null,
    error: null,
  },
  states: {
    courseOverview: {
      on: {
        ENROLL: { target: "enrolling", actions: "clearError" },
        CONTINUE_LEARNING: { target: "lessonList", actions: "clearError" },
      },
    },
    enrolling: {
      on: {
        ENROLL_SUCCESS: "lessonList",
        ENROLL_FAILED: { target: "courseOverview", actions: "setError" },
      },
    },
    lessonList: {
      on: {
        SELECT_LESSON: {
          target: "loadingVideo",
          actions: ["setSelectedLesson", "clearError"],
        },
        NEXT_LESSON: {
          target: "loadingVideo",
          actions: ["setSelectedLesson", "clearError"],
        },
        BACK_TO_COURSE: "courseOverview",
        COURSE_COMPLETED: "courseCompleted",
      },
    },
    loadingVideo: {
      on: {
        SELECT_LESSON: {
          target: "loadingVideo",
          actions: ["setSelectedLesson", "clearError"],
        },
        VIDEO_READY: "watchingVideo",
        VIDEO_ERROR: { target: "videoError", actions: "setError" },
        BACK_TO_LESSONS: "lessonList",
        COURSE_COMPLETED: "courseCompleted",
      },
    },
    watchingVideo: {
      on: {
        SELECT_LESSON: {
          target: "loadingVideo",
          actions: ["setSelectedLesson", "clearError"],
        },
        MARK_COMPLETE: "savingProgress",
        VIDEO_ERROR: { target: "videoError", actions: "setError" },
        BACK_TO_LESSONS: "lessonList",
        COURSE_COMPLETED: "courseCompleted",
      },
    },
    savingProgress: {
      on: {
        SAVE_SUCCESS: "lessonList",
        COURSE_COMPLETED: "courseCompleted",
        SAVE_FAILED: { target: "watchingVideo", actions: "setError" },
      },
    },
    videoError: {
      on: {
        SELECT_LESSON: {
          target: "loadingVideo",
          actions: ["setSelectedLesson", "clearError"],
        },
        RETRY: { target: "loadingVideo", actions: "clearError" },
        BACK_TO_LESSONS: "lessonList",
      },
    },
    courseCompleted: {
      on: {
        SUBMIT_RATING: { target: "submittingRating", actions: "clearError" },
        BACK_TO_COURSE: "courseOverview",
      },
    },
    submittingRating: {
      on: {
        RATING_SUCCESS: "ratingSubmitted",
        RATING_FAILED: { target: "courseCompleted", actions: "setError" },
      },
    },
    ratingSubmitted: {
      on: {
        BACK_TO_COURSE: "courseOverview",
      },
    },
  },
});
