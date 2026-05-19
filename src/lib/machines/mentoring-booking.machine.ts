import { assign, setup } from "xstate";

export type MentoringBookingContext = {
  mentorId: string | null;
  slotId: string | null;
  error: string | null;
};

export type MentoringBookingEvent =
  | { type: "SELECT_MENTOR"; mentorId: string }
  | { type: "VIEW_SCHEDULE" }
  | { type: "SELECT_SLOT"; slotId: string }
  | { type: "SUBMIT" }
  | { type: "SUCCESS" }
  | { type: "FAILED"; error?: string }
  | { type: "ACCEPTED" }
  | { type: "REJECTED"; error?: string }
  | { type: "COMPLETE_SESSION" }
  | { type: "GIVE_REVIEW" }
  | { type: "CHOOSE_ANOTHER" }
  | { type: "BACK" };

export const mentoringBookingMachine = setup({
  types: {} as {
    context: MentoringBookingContext;
    events: MentoringBookingEvent;
  },
  actions: {
    clearError: assign({ error: null }),
    setMentor: assign({
      mentorId: ({ event }) =>
        event.type === "SELECT_MENTOR" ? event.mentorId : null,
      slotId: null,
      error: null,
    }),
    setSlot: assign({
      slotId: ({ event }) => (event.type === "SELECT_SLOT" ? event.slotId : null),
      error: null,
    }),
    setError: assign({
      error: ({ event }) =>
        "error" in event && event.error ? event.error : "Booking gagal diproses.",
    }),
  },
}).createMachine({
  id: "mentoringBooking",
  initial: "viewingMentors",
  context: {
    mentorId: null,
    slotId: null,
    error: null,
  },
  states: {
    viewingMentors: {
      on: {
        SELECT_MENTOR: { target: "viewingProfile", actions: "setMentor" },
      },
    },
    viewingProfile: {
      on: {
        VIEW_SCHEDULE: "selectingSchedule",
        BACK: "viewingMentors",
        CHOOSE_ANOTHER: "viewingMentors",
      },
    },
    selectingSchedule: {
      on: {
        SELECT_SLOT: { target: "fillingForm", actions: "setSlot" },
        BACK: "viewingProfile",
        CHOOSE_ANOTHER: "viewingMentors",
      },
    },
    fillingForm: {
      on: {
        SUBMIT: { target: "submittingBooking", actions: "clearError" },
        BACK: "selectingSchedule",
      },
    },
    submittingBooking: {
      on: {
        SUCCESS: "waitingConfirmation",
        FAILED: { target: "fillingForm", actions: "setError" },
      },
    },
    waitingConfirmation: {
      on: {
        ACCEPTED: "scheduled",
        REJECTED: { target: "rejected", actions: "setError" },
        CHOOSE_ANOTHER: "viewingMentors",
      },
    },
    scheduled: {
      on: {
        COMPLETE_SESSION: "completed",
      },
    },
    rejected: {
      on: {
        CHOOSE_ANOTHER: "viewingMentors",
      },
    },
    completed: {
      on: {
        GIVE_REVIEW: "reviewed",
      },
    },
    reviewed: {
      on: {
        CHOOSE_ANOTHER: "viewingMentors",
      },
    },
  },
});
