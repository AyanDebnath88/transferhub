// Transfer-window calendar. When the window is shut there are no new deals to
// report, so the transfer pages show a "closed — watch football news" banner
// instead of implying business is still live. Dates are the main European
// windows; edit each season and redeploy (they only drive the banner/copy).
export interface TransferWindow { name: string; opens: string; closes: string } // ISO (inclusive)

// Ordered by date. Extend as new seasons are announced.
export const WINDOWS: TransferWindow[] = [
  { name: 'Summer 2026', opens: '2026-06-10', closes: '2026-09-01' },
  { name: 'Winter 2027', opens: '2027-01-01', closes: '2027-02-02' },
  { name: 'Summer 2027', opens: '2027-06-10', closes: '2027-09-01' },
];

export interface WindowStatus {
  open: boolean;
  current?: TransferWindow;   // the window we're inside (when open)
  next?: TransferWindow;      // the next window to open (when closed)
  closesOn?: string;          // ISO, when open
  nextOpensOn?: string;       // ISO, when closed
}

const day = (iso: string) => new Date(`${iso}T00:00:00Z`).getTime();

export function getWindowStatus(now: Date = new Date()): WindowStatus {
  const t = now.getTime();
  for (const w of WINDOWS) {
    // treat the close date as inclusive to end-of-day
    if (t >= day(w.opens) && t <= day(w.closes) + 86_400_000 - 1) {
      return { open: true, current: w, closesOn: w.closes };
    }
  }
  const next = WINDOWS.find((w) => day(w.opens) > t);
  return { open: false, next, nextOpensOn: next?.opens };
}

export const fmtWindowDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
