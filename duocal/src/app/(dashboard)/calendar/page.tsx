import { Suspense } from "react";
import { CalendarPageClient } from "./CalendarPageClient";

function CalendarFallback() {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-duocal-border bg-duocal-slate">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-duocal-accent border-t-transparent" />
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarFallback />}>
      <CalendarPageClient />
    </Suspense>
  );
}
