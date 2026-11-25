'use client';

import Link from 'next/link';
import { GAME_ICONS } from '@/components/games/iconMap';
import { GAMES, GAME_ORDER, DIFFICULTY_STYLES } from '@/lib/games';
import { useGameCurrency } from '@/context/GameCurrencyContext';

const FEATURES = [
  {
    title: 'One wallet, six games',
    body: 'A single coin balance follows you from Plinko to Snake. Win in one game, spend it in another.',
    accent: '#00ff88',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <rect x="2.5" y="6" width="19" height="13" rx="3" />
        <path d="M2.5 10h19" />
        <circle cx="17" cy="14.5" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: 'Provably fair drops',
    body: 'Plinko outcomes are sealed server-side with a weighted CSPRNG — the client only replays the returned path.',
    accent: '#00e5ff',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path d="M12 2.5 20 6v6c0 5-3.5 8.5-8 9.5C7.5 20.5 4 17 4 12V6l8-3.5z" />
        <path d="m9 12 2 2 4-4.5" />
      </svg>
    ),
  },
  {
    title: 'Zero installs',
    body: 'Everything runs in your browser — open the arcade and you are playing in seconds, on desktop or phone.',
    accent: '#f472b6',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path d="M13 2 4.5 13.5h6L11 22l8.5-11.5h-6L13 2z" fill="currentColor" fillOpacity="0.15" />
        <path d="M13 2 4.5 13.5h6L11 22l8.5-11.5h-6L13 2z" />
      </svg>
    ),
  },
  {
    title: 'Your coins, kept safe',
    body: 'Accounts are stored in MongoDB with scrypt-hashed passwords; the wallet syncs locally in IndexedDB.',
    accent: '#fbbf24',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <rect x="4" y="10" width="16" height="10" rx="2.5" />
        <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
        <circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Create your account',
    body: 'Pick a player name and you are in. Prefer to look around first? Take the $50 guest trial — no account needed.',
    accent: '#00ff88',
  },
  {
    n: '02',
    title: 'Get your coins',
    body: 'Every new account lands $100 free coins on the shared wallet. Guests start with $50 trial credits.',
    accent: '#00e5ff',
  },
  {
    n: '03',
    title: 'Play and climb',
    body: 'Every game costs $1 a turn and pays back its own way. Cash in, chase the multipliers, brag on the leaderboard.',
    accent: '#f472b6',
  },
];

export default function LandingPage() {
  const { username, isAuthLoaded } = useGameCurrency();
  const signedIn = isAuthLoaded && username !== 'Player';

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* ------------------------------- nav ------------------------------- */}
      <nav className="sticky sticky-safe-top z-50 bg-black/70 backdrop-blur-md border-b border-green-500/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            {/* <span className="w-9 h-9 rounded-xl bg-linear-to-br from-green-500 to-emerald-700 flex items-center justify-center text-black font-black neon-glow">
              N
            </span> */}
            <span className="font-display font-bold text-lg uppercase tracking-widest text-white">
              <span className="neon-text">Neon</span> <span className="neon-text-cyan">Arcade</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
            <a href="#games" className="inline-flex items-center min-h-11 hover:text-green-400 transition-colors">Games</a>
            <a href="#how" className="inline-flex items-center min-h-11 hover:text-green-400 transition-colors">How it works</a>
            <a href="#why" className="inline-flex items-center min-h-11 hover:text-green-400 transition-colors">Why Neon</a>
          </div>
          <div className="flex items-center gap-2">
            {signedIn ? (
              <Link
                href="/arcade"
                className="inline-flex items-center min-h-11 px-4 py-2 rounded-xl bg-linear-to-r from-green-500 to-emerald-700 text-black font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Enter arcade
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center min-h-11 px-3.5 py-2 rounded-xl text-zinc-300 hover:text-white text-sm font-semibold transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center min-h-11 px-4 py-2 rounded-xl bg-linear-to-r from-green-500 to-emerald-700 text-black font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ------------------------------- hero ------------------------------ */}
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2
         w-184 h-184 rounded-full bg-green-500/8 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -right-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-14 sm:pt-24 sm:pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-neon" />
              6 games · 1 balance · 0 installs
            </span> */}
            <h1 className="font-display font-bold text-4xl sm:text-5xl xl:text-6xl leading-[1.05] tracking-tight text-white">
              Play. Win coins.
              <br />
              <span className="neon-text text-green-100">Climb</span>{' '}
              <span className="neon-text-cyan text-cyan-100">the board.</span>
            </h1>
            <p className="mt-5 text-zinc-400 text-base sm:text-lg leading-relaxed max-w-xl">
              Neon Arcade is a browser playground of six quick games all running on
              one shared coin wallet. Create an account and get{' '}
              <span className="text-green-100 font-semibold">$100 free coins</span>,
              or jump straight in with the{' '}
              <span className="text-cyan-100 font-semibold">$50 guest trial</span>.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="px-6 py-3.5 rounded-xl bg-linear-to-r from-green-900
                 to-emerald-900 text-white font-bold hover:opacity-90 hover:shadow-lg hover:shadow-green-500/25 transition-all"
              >
                Create free account — $100 coins
              </Link>
              <Link
                href="/arcade"
                className="px-6 py-3.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-100 font-semibold hover:bg-cyan-500/20 transition-colors"
              >
                Try as guest — $50
              </Link>
            </div>
            <p className="mt-4 text-zinc-600 text-xs">
              No credit card. No downloads. Your name, your coins, your board.
            </p>
          </div>

          {/* floating game preview */}
          <div className="relative hidden lg:block" aria-hidden>
            <div className="grid grid-cols-2 gap-4 rotate-2">
              {GAME_ORDER.map((id, i) => {
                const game = GAMES[id];
                const Icon = GAME_ICONS[id];
                return (
                  <div
                    key={id}
                    className="bg-dark-card/70 backdrop-blur-sm border border-white/10 rounded-2xl p-5 card-hover"
                    style={{
                      transform: `translateY(${(i % 2 === 0 ? -8 : 8) + Math.floor(i / 2) * 4}px)`,
                      boxShadow: `0 0 24px ${game.accent}14`,
                    }}
                  >
                    <span
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${game.accent}1f`, color: game.accent }}
                    >
                      <Icon className="w-7 h-7" />
                    </span>
                    <p className="text-white font-display font-semibold">{game.name}</p>
                    <p className="text-zinc-500 text-xs mt-1">{game.tagline}</p>
                    <p
                      className="mt-3 text-[11px] font-mono font-bold px-2 py-1 rounded-md inline-block"
                      style={{ color: game.accent, background: `${game.accent}14` }}
                    >
                      {game.payout}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------------ games ------------------------------ */}
      <section id="games" className="max-w-6xl mx-auto px-4 sm:px-6 py-14 w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
              Six games, <span className="neon-text text-green-100">one wallet</span>
            </h2>
            <p className="text-zinc-500 text-sm mt-2">
              Every game charges $1 per turn and pays back its own way.
            </p>
          </div>
          <Link href="/arcade" className="hidden sm:inline-flex text-green-400 hover:text-green-300 text-sm font-semibold">
            Open arcade →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {GAME_ORDER.map((id) => {
            const game = GAMES[id];
            const Icon = GAME_ICONS[id];
            return (
              <Link
                key={id}
                href={`/arcade/${id}`}
                className="group relative bg-dark-card/60 backdrop-blur-sm border border-white/10 rounded-2xl p-5 sm:p-6 card-hover overflow-hidden"
              >
                <div
                  className="absolute inset-x-0 top-0 h-0.5 opacity-70"
                  style={{ background: `linear-gradient(90deg, transparent, ${game.accent}, transparent)` }}
                />
                <div className="flex items-start justify-between mb-4">
                  <span
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: `${game.accent}1f`, color: game.accent }}
                  >
                    <Icon className="w-7 h-7" />
                  </span>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${DIFFICULTY_STYLES[game.difficulty]}`}
                    >
                      {game.difficulty}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold"
                      style={{ color: game.accent, background: `${game.accent}14` }}
                    >
                      {game.payout}
                    </span>
                  </div>
                </div>
                <h3 className="font-display font-semibold text-lg text-white group-hover:text-white transition-colors">
                  {game.name}
                </h3>
                <p className="text-zinc-500 text-sm mt-1 leading-relaxed">{game.description}</p>
                <span
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: game.accent }}
                >
                  Play now
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* --------------------------- how it works -------------------------- */}
      <section id="how" className="border-y border-white/5 bg-dark-card/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight text-center">
            From zero to <span className="neon-text-cyan text-cyan-200">first win</span> in three steps
          </h2>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-10">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="relative bg-dark-card/60 border border-white/10 rounded-2xl p-6"
              >
                <span
                  className="font-mono font-black text-4xl"
                  style={{ color: step.accent, textShadow: `0 0 18px ${step.accent}66` }}
                >
                  {step.n}
                </span>
                <h3 className="text-white font-display font-semibold text-lg mt-3">{step.title}</h3>
                <p className="text-zinc-500 text-sm mt-2 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- features ---------------------------- */}
      <section id="why" className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight text-center">
          Built like a real arcade, <span className="neon-text text-green-100">not a toy</span>
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 mt-10">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex gap-4 bg-dark-card/60 border border-white/10 rounded-2xl p-6 card-hover"
            >
              <span
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${feature.accent}1a`, color: feature.accent }}
              >
                {feature.icon}
              </span>
              <div>
                <h3 className="text-white font-display font-semibold">{feature.title}</h3>
                <p className="text-zinc-500 text-sm mt-1.5 leading-relaxed">{feature.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------ CTA -------------------------------- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 w-full">
        <div className="relative overflow-hidden rounded-3xl border border-green-500/25 bg-dark-card/70 p-8 sm:p-12 text-center neon-glow">
          <div className="pointer-events-none absolute -top-24 left-1/4 w-72 h-72 rounded-full bg-green-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/4 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <h2 className="relative z-10 font-display font-bold text-2xl sm:text-4xl text-white tracking-tight">
            Ready to ride the <span className="neon-text text-green-100">neon</span>?
          </h2>
          <p className="relative z-10 text-zinc-400 mt-3 max-w-xl mx-auto">
            Grab $100 free coins when you sign up — or take the $50 guest trial
            for a spin first. Either way, the board is waiting.
          </p>
          <div className="relative z-10 mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="px-6 py-3.5 rounded-xl bg-linear-to-r from-green-500 to-emerald-700 text-black font-bold hover:opacity-90 transition-opacity"
            >
              Sign up free
            </Link>
            <Link
              href="/arcade"
              className="px-6 py-3.5 rounded-xl border border-white/15 text-white font-semibold hover:bg-white/5 transition-colors"
            >
              Enter as guest
            </Link>
          </div>
        </div>
      </section>

      {/* ----------------------------- footer ------------------------------ */}
      <footer className="border-t border-white/5 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-zinc-600 text-xs flex items-center gap-1.5">
            Neon Arcade — six games, one balance, endless reruns.
          </p>
          <div className="flex items-center gap-5 text-xs text-zinc-600">
            <Link href="/arcade" className="hover:text-green-400 transition-colors">Arcade</Link>
            <Link href="/signup" className="hover:text-green-400 transition-colors">Sign up</Link>
            <Link href="/login" className="hover:text-green-400 transition-colors">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
