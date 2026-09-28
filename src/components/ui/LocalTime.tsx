'use client';

import { useEffect, useState } from 'react';

interface LocalTimeProps {
  timeZone: string;
  className?: string;
}

function formatNow(timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(new Date());
}

/**
 * Live HH:MM readout for a fixed IANA time zone. Renders a fixed-width
 * placeholder on the server (no hydration mismatch, no layout shift) and
 * ticks on each minute boundary after mount.
 */
export function LocalTime({ timeZone, className }: LocalTimeProps) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setTime(formatNow(timeZone));
      const now = Date.now();
      const msToNextMinute = 60_000 - (now % 60_000) + 50;
      timer = setTimeout(tick, msToNextMinute);
    };
    tick();
    return () => clearTimeout(timer);
  }, [timeZone]);

  return (
    <time
      className={['inline-block min-w-[5ch] tabular-nums', className].filter(Boolean).join(' ')}
      dateTime={time ?? undefined}
      aria-label={time ? `Local time ${time}` : 'Local time'}
      suppressHydrationWarning
    >
      {time ?? '--:--'}
    </time>
  );
}
