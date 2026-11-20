import { useState, useMemo } from "react";
import { useBookingStore, type Booking } from "@/stores/booking-store";
import { CATEGORIES } from "@/lib/products";

// Services customers can book. Salon-style categories only (skip product ones).
const SERVICES = [
  "Men's Hair",
  "Women's Hair",
  "Brows & Lashes",
  "Nails",
].filter((s) => (CATEGORIES as readonly string[]).includes(s));

// Time slots offered each day.
const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

function todayISO(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function BookingDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const addBooking = useBookingStore((s) => s.addBooking);

  const [service, setService] = useState(SERVICES[0] ?? "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("");
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [error, setError] = useState("");

  const minDate = useMemo(() => todayISO(), []);

  const resetForm = () => {
    setService(SERVICES[0] ?? "");
    setName("");
    setPhone("");
    setDate(todayISO());
    setTime("");
    setError("");
  };

  const handleClose = () => {
    onClose();
    // Give the drawer time to slide out before clearing the confirmation view.
    setTimeout(() => setConfirmed(null), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !name.trim() || !phone.trim() || !date || !time) {
      setError("Please fill in every field and pick a time slot.");
      return;
    }
    const booking = addBooking({
      service,
      name: name.trim(),
      phone: phone.trim(),
      date,
      time,
    });
    setConfirmed(booking);
    resetForm();
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Drawer */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10">
          <h2 className="font-serif text-2xl">
            {confirmed ? "Appointment Booked" : "Book an Appointment"}
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-ink text-cream flex items-center justify-center hover:bg-ink/90 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {confirmed ? (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <p className="font-serif text-xl mb-1">You're all set, {confirmed.name}!</p>
              <p className="text-sm text-muted-foreground mb-6">
                Please arrive 5 minutes before your slot.
              </p>

              {/* Line number — the headline detail */}
              <div className="w-full bg-[#1a237e] text-[#f8f6f0] rounded-lg px-6 py-5 mb-4">
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#c9a84c]/80 mb-1">
                  Your Line Number
                </p>
                <p className="font-serif text-5xl text-[#c9a84c]">
                  #{confirmed.lineNumber}
                </p>
              </div>

              {/* Slot details */}
              <dl className="w-full text-left border border-ink/10 rounded-lg divide-y divide-ink/10">
                <div className="flex justify-between px-4 py-3">
                  <dt className="text-sm text-muted-foreground">Service</dt>
                  <dd className="text-sm font-medium">{confirmed.service}</dd>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <dt className="text-sm text-muted-foreground">Date</dt>
                  <dd className="text-sm font-medium text-right">
                    {formatDate(confirmed.date)}
                  </dd>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <dt className="text-sm text-muted-foreground">Time</dt>
                  <dd className="text-sm font-medium">{confirmed.time}</dd>
                </div>
              </dl>

              <button
                onClick={() => setConfirmed(null)}
                className="mt-6 text-[11px] tracking-[0.3em] uppercase border-b border-ink pb-1 hover:border-gold hover:text-gold transition-colors"
              >
                Book Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Service">
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full border border-ink/20 rounded px-3 py-2.5 text-sm bg-white focus:border-ink outline-none"
                >
                  {SERVICES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Full Name">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full border border-ink/20 rounded px-3 py-2.5 text-sm focus:border-ink outline-none"
                />
              </Field>

              <Field label="Phone Number">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+27 65 128 2352"
                  className="w-full border border-ink/20 rounded px-3 py-2.5 text-sm focus:border-ink outline-none"
                />
              </Field>

              <Field label="Date">
                <input
                  type="date"
                  value={date}
                  min={minDate}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-ink/20 rounded px-3 py-2.5 text-sm focus:border-ink outline-none"
                />
              </Field>

              <Field label="Time Slot">
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const selected = time === slot;
                    return (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setTime(slot)}
                        className={`py-2 text-xs rounded border transition-colors ${
                          selected
                            ? "bg-[#1a237e] text-[#c9a84c] border-[#1a237e]"
                            : "border-ink/20 hover:border-ink"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-ink text-cream py-4 text-[11px] tracking-[0.3em] uppercase hover:bg-ink/90 transition-colors"
              >
                Confirm Booking
              </button>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
