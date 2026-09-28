'use client';

import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { profile } from '@content/profile';
import {
  SECTION_IDS,
  SECTION_LABELS,
  SHORTCUTS,
  modKeyLabel,
  openExternal,
  type PaletteProject,
  type SectionId,
} from '@/lib/shortcuts';
import { THEMES, THEME_DESCRIPTIONS, THEME_LABELS, THEME_SWATCHES } from '@/lib/theme';
import { useShortcuts } from '@/components/experience/shortcuts/ShortcutsProvider';
import { useTheme } from '@/components/experience/theme/ThemeProvider';

const SECTION_ORDER: SectionId[] = [
  SECTION_IDS.hero,
  SECTION_IDS.highlights,
  SECTION_IDS.work,
  SECTION_IDS.about,
  SECTION_IDS.ventures,
  SECTION_IDS.contact,
];

const SECTION_KEY: Partial<Record<SectionId, string>> = Object.fromEntries(
  SHORTCUTS.filter((s) => s.action.type === 'section').map((s) => [
    (s.action as { id: SectionId }).id,
    s.key,
  ]),
);

const ROUTES: { label: string; href: string; keywords: string[] }[] = [
  { label: 'Changelog', href: '/changelog', keywords: ['updates', 'log', 'recent'] },
  { label: 'Writing', href: '/writing', keywords: ['blog', 'posts', 'articles'] },
];

const SOCIALS = profile.socials.filter((s) => s.platform !== 'email');

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Strict matcher replacing cmdk's fuzzy command-score: every whitespace-
 * separated term must appear as a substring of the label or a keyword.
 * Label prefix > label substring > keyword hit. Fuzzy scoring let "ultra"
 * surface "Writing" ahead of "Ultraviolet", which is worse than no match.
 */
function strictFilter(value: string, search: string, keywords: string[] = []): number {
  const q = search.trim().toLowerCase();
  if (!q) return 1;
  const label = value.toLowerCase();
  const hay = `${label} ${keywords.join(' ').toLowerCase()}`;
  const terms = q.split(/\s+/);
  if (!terms.every((t) => hay.includes(t))) return 0;
  if (label.startsWith(q)) return 1;
  if (label.includes(q)) return 0.8;
  return 0.5;
}

/**
 * Cmd/Ctrl+K menu built on cmdk. The dialog shell (portal, overlay,
 * focus trap, focus return, scroll lock, Esc) is ours so it stays free of
 * extra dependencies and renders nothing on the server. Open state lives
 * in ShortcutsProvider so the keyboard handler, PaletteTrigger and the
 * hint bar share it.
 */
export function CommandPalette({ projects }: { projects: PaletteProject[] }) {
  const { open, page, setOpen, setPage, navigateTo, run, apple } = useShortcuts();
  const { theme, setTheme, cycleTheme } = useTheme();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const copiedTimer = useRef<number | null>(null);
  const titleId = useId();

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setOpen(false), [setOpen]);

  /* Reset transient state and manage focus + scroll lock around open/close. */
  useEffect(() => {
    if (!open) return;
    setSearch('');
    setCopied(false);
    restoreFocusRef.current = (document.activeElement as HTMLElement | null) ?? null;

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = overflow;
      const el = restoreFocusRef.current;
      if (el && typeof el.focus === 'function' && document.contains(el)) el.focus();
      restoreFocusRef.current = null;
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    };
  }, [open]);

  /* Re-focus the input when switching pages (the list re-renders). */
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, page]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
      return;
    }
    if (e.key === 'Backspace' && search === '' && page !== 'root') {
      e.preventDefault();
      setPage('root');
      return;
    }
    if (e.key === 'Tab') {
      // Focus trap: cycle within the dialog.
      const root = dialogRef.current;
      if (!root) return;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null || n === document.activeElement,
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || !root.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !root.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const go = (href: string) => {
    close();
    router.push(href);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable (insecure context / permissions): fall back to mailto.
      window.location.href = `mailto:${profile.email}`;
      close();
    }
  };

  if (!mounted || !open) return null;

  const mod = modKeyLabel(apple);

  return createPortal(
    <div className="fixed inset-0 z-(--z-palette)" data-pp-palette onKeyDown={onKeyDown}>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onPointerDown={close}
        className="pp-anim-fade absolute inset-0 bg-bg/70 backdrop-blur-sm"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="pp-anim-rise pp-palette relative mx-auto mt-[12vh] w-[min(38rem,calc(100vw-1.5rem))] overflow-hidden rounded-lg border border-border bg-bg-elevated text-fg shadow-[0_30px_80px_-20px_rgb(0_0_0/0.55)] sm:mt-[14vh]"
      >
        <h2 id={titleId} className="sr-only">
          Command menu
        </h2>

        <Command label="Command menu" loop filter={strictFilter}>
          <div className="flex items-center gap-2 border-b border-border px-3">
            {page !== 'root' && (
              <button
                type="button"
                onClick={() => setPage('root')}
                aria-label="Back to all commands"
                className="rounded-xs border border-border px-1.5 py-0.5 font-mono text-micro text-fg-muted transition-colors duration-(--dur-fast) hover:text-fg"
              >
                ←
              </button>
            )}
            <span aria-hidden="true" className="font-mono text-label text-accent select-none">
              {page === 'shortcuts' ? '?' : '›'}
            </span>
            <Command.Input
              ref={inputRef}
              value={search}
              onValueChange={setSearch}
              placeholder={
                page === 'shortcuts' ? 'Search shortcuts…' : 'Jump to a section, project, action…'
              }
              aria-label={page === 'shortcuts' ? 'Search shortcuts' : 'Search commands'}
              className="min-w-0 flex-1 bg-transparent py-3.5 font-sans text-body text-fg outline-none placeholder:text-fg-muted/70"
            />
            <kbd className="hidden rounded-xs border border-border px-1.5 py-0.5 font-mono text-micro text-fg-muted sm:inline-block">
              esc
            </kbd>
          </div>

          <Command.List className="max-h-[min(60vh,26rem)] overflow-y-auto overscroll-contain p-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-micro [&_[cmdk-group-heading]]:tracking-mono [&_[cmdk-group-heading]]:text-fg-muted [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:select-none [&_[cmdk-group]+[cmdk-group]]:mt-1">
            <Command.Empty className="px-3 py-8 text-center font-mono text-label text-fg-muted">
              Nothing matches.
            </Command.Empty>

            {page === 'root' ? (
              <>
                <Command.Group heading="Navigate">
                  {SECTION_ORDER.map((id) => (
                    <Item
                      key={id}
                      value={SECTION_LABELS[id]}
                      keywords={['section', 'go']}
                      hint={SECTION_KEY[id]}
                      onSelect={() => {
                        close();
                        navigateTo(id);
                      }}
                    >
                      {SECTION_LABELS[id]}
                    </Item>
                  ))}
                  {ROUTES.map((r) => (
                    <Item
                      key={r.href}
                      value={r.label}
                      keywords={r.keywords}
                      hint={r.href}
                      onSelect={() => go(r.href)}
                    >
                      {r.label}
                    </Item>
                  ))}
                </Command.Group>

                {projects.length > 0 && (
                  <Command.Group heading="Projects">
                    {projects.map((p) => (
                      <Item
                        key={p.slug}
                        value={p.title}
                        keywords={[p.slug, p.summary, 'project', 'work', 'case study']}
                        hint={`/work/${p.slug}`}
                        sub={p.summary}
                        onSelect={() => go(`/work/${p.slug}`)}
                      >
                        {p.title}
                      </Item>
                    ))}
                  </Command.Group>
                )}

                <Command.Group heading="Actions">
                  <Item
                    value="Copy email"
                    keywords={['contact', 'mail', profile.email]}
                    hint={copied ? 'copied' : profile.email}
                    accent={copied}
                    onSelect={copyEmail}
                  >
                    {copied ? `Copied ${profile.email}` : 'Copy email'}
                  </Item>
                  <Item
                    value="Download resume"
                    keywords={['cv', 'pdf']}
                    hint="r"
                    onSelect={() => {
                      close();
                      run({ type: 'resume' });
                    }}
                  >
                    Download resume
                  </Item>
                  {SOCIALS.map((s) => (
                    <Item
                      key={s.platform}
                      value={`Open ${s.label}`}
                      keywords={[s.handle, 'social', 'link']}
                      hint={s.platform === 'github' ? 'g' : s.handle}
                      onSelect={() => {
                        close();
                        openExternal(s.href);
                      }}
                    >
                      Open {s.label}
                    </Item>
                  ))}
                </Command.Group>

                <Command.Group heading="Theme">
                  {THEMES.map((id) => (
                    <Item
                      key={id}
                      value={THEME_LABELS[id]}
                      keywords={['theme', 'mode', 'color', THEME_DESCRIPTIONS[id]]}
                      hint={id === theme ? 'active' : undefined}
                      accent={id === theme}
                      sub={THEME_DESCRIPTIONS[id]}
                      onSelect={() => setTheme(id)}
                      icon={<Swatch id={id} />}
                    >
                      {THEME_LABELS[id]}
                    </Item>
                  ))}
                  <Item
                    value="Cycle theme"
                    keywords={['next', 'switch', 'mode']}
                    hint="t"
                    onSelect={() => cycleTheme()}
                  >
                    Cycle theme
                  </Item>
                </Command.Group>

                <Command.Group heading="Help">
                  <Item
                    value="All keyboard shortcuts"
                    keywords={['keys', 'help', '?']}
                    hint="?"
                    onSelect={() => setPage('shortcuts')}
                  >
                    All keyboard shortcuts
                  </Item>
                </Command.Group>
              </>
            ) : (
              <Command.Group heading="Shortcuts">
                <Item
                  value="Open or close this menu"
                  keywords={['palette', 'command', 'k']}
                  hint={`${mod} K`}
                >
                  Open or close this menu
                </Item>
                {SHORTCUTS.map((s) => (
                  <Item
                    key={s.key}
                    value={s.label}
                    keywords={[s.key]}
                    hint={s.key}
                    onSelect={() => {
                      if (s.action.type === 'help') return;
                      if (s.action.type !== 'palette') close();
                      else setPage('root');
                      run(s.action);
                    }}
                  >
                    {s.label}
                  </Item>
                ))}
                <Item value="Close" keywords={['escape']} hint="esc" onSelect={close}>
                  Close
                </Item>
              </Command.Group>
            )}
          </Command.List>

          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5 font-mono text-micro tracking-mono text-fg-muted select-none">
            <span aria-live="polite" className={copied ? 'text-accent' : undefined}>
              {copied ? `Copied ${profile.email}` : 'Everything on this site, one keystroke away.'}
            </span>
            <span className="hidden shrink-0 sm:inline">↑↓ move · ↵ select · esc close</span>
          </div>
        </Command>
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */

function Swatch({ id }: { id: (typeof THEMES)[number] }) {
  const sw = THEME_SWATCHES[id];
  return (
    <span
      aria-hidden="true"
      className="block size-3 shrink-0 rounded-pill border border-border"
      style={{ background: `linear-gradient(135deg, ${sw.accent} 0 50%, ${sw.bg} 50% 100%)` }}
    />
  );
}

function Item({
  children,
  value,
  keywords,
  hint,
  sub,
  accent,
  icon,
  onSelect,
}: {
  children: React.ReactNode;
  value: string;
  keywords?: string[];
  /** Right-aligned mono hint: a key, a route, a handle. */
  hint?: string;
  /** Muted secondary line. */
  sub?: string;
  /** Tint the label with the accent (active theme, copied state). */
  accent?: boolean;
  icon?: React.ReactNode;
  onSelect?: () => void;
}) {
  return (
    <Command.Item
      value={value}
      keywords={keywords}
      onSelect={onSelect}
      className={`group/item flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-label text-fg-muted transition-colors duration-(--dur-instant) outline-none select-none aria-selected:bg-accent/12 aria-selected:text-fg data-[disabled=true]:opacity-40 ${accent ? 'text-accent aria-selected:text-accent' : ''}`}
    >
      {icon}
      <span className="block min-w-0 flex-1">
        <span className="block truncate">{children}</span>
        {sub && (
          <span className="mt-0.5 hidden truncate font-sans text-micro tracking-normal text-fg-muted/80 normal-case sm:block">
            {sub}
          </span>
        )}
      </span>
      {hint && (
        <kbd className="max-w-[40%] shrink-0 truncate rounded-xs border border-border px-1.5 py-0.5 font-mono text-micro tracking-mono text-fg-muted group-aria-selected/item:border-accent/40 group-aria-selected/item:text-fg">
          {hint}
        </kbd>
      )}
    </Command.Item>
  );
}
