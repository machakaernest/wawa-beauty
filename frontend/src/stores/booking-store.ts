import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Booking = {
  id: string;
  lineNumber: number;
  service: string;
  name: string;
  phone: string;
  date: string; // ISO date, e.g. "2026-09-20"
  time: string; // slot, e.g. "10:30"
  createdAt: number;
};

export type NewBooking = Omit<Booking, "id" | "lineNumber" | "createdAt">;

type BookingState = {
  bookings: Booking[];
  nextLine: number;
  addBooking: (booking: NewBooking) => Booking;
  cancelBooking: (id: string) => void;
  clearBookings: () => void;
  totalBookings: () => number;
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      bookings: [],
      nextLine: 1,

      addBooking: (booking) => {
        const lineNumber = get().nextLine;
        const created: Booking = {
          ...booking,
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          lineNumber,
          createdAt: Date.now(),
        };
        set({
          bookings: [created, ...get().bookings],
          nextLine: lineNumber + 1,
        });
        return created;
      },

      cancelBooking: (id) => {
        set({ bookings: get().bookings.filter((b) => b.id !== id) });
      },

      clearBookings: () => set({ bookings: [] }),

      totalBookings: () => get().bookings.length,
    }),
    {
      name: "wawa-bookings",
    },
  ),
);
