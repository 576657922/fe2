import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type PomodoroState = {
  isRunning: boolean;
  timeLeft: number;
  totalTime: number;
  sessionsCompleted: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setTotalTime: (seconds: number) => void;
  decrementTime: () => void;
  completeSession: () => void;
};

const DEFAULT_DURATION = 25 * 60;

const storage = createJSONStorage(() => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    } as unknown as Storage;
  }
  return window.localStorage;
});

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set) => ({
      isRunning: false,
      timeLeft: DEFAULT_DURATION,
      totalTime: DEFAULT_DURATION,
      sessionsCompleted: 0,
      start: () =>
        set((state) => ({
          isRunning: state.timeLeft > 0 ? true : state.isRunning,
          timeLeft: state.timeLeft === 0 ? state.totalTime : state.timeLeft,
        })),
      pause: () => set({ isRunning: false }),
      reset: () =>
        set((state) => ({
          isRunning: false,
          timeLeft: state.totalTime,
        })),
      setTotalTime: (seconds) =>
        set(() => ({
          totalTime: seconds,
          timeLeft: seconds,
          isRunning: false,
        })),
      decrementTime: () =>
        set((state) => {
          if (!state.isRunning || state.timeLeft <= 0) {
            return state;
          }

          const updatedTime = state.timeLeft - 1;
          if (updatedTime <= 0) {
            return {
              ...state,
              isRunning: false,
              timeLeft: 0,
            };
          }

          return { ...state, timeLeft: updatedTime };
        }),
      completeSession: () =>
        set((state) => ({
          isRunning: false,
          sessionsCompleted: state.sessionsCompleted + 1,
          timeLeft: state.totalTime,
        })),
    }),
    {
      name: "pomodoro-store",
      storage,
      partialize: (state) => ({
        isRunning: state.isRunning,
        timeLeft: state.timeLeft,
        totalTime: state.totalTime,
        sessionsCompleted: state.sessionsCompleted,
      }),
    }
  )
);
