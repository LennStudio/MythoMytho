/** Simule des parties complètes à travers le réducteur (aucune UI). */
import { assignRound, SPECIAL_KEYS, type DrawnPair, type SpecialRolesConfig } from '../src/domain';
import { gameReducer, initialGameState, alive, type GameState, type GameAction } from '../src/state/gameReducer';

declare const process: { exit(code: number): never };
declare const console: { error(...a: unknown[]): void; log(...a: unknown[]): void };
let fail = 0, n = 0;
const ok = (c: boolean, l: string): void => { n++; if (!c) { fail++; console.error('✗ ' + l); } };

const roles = (on: string[]): SpecialRolesConfig =>
  ({ ...Object.fromEntries(SPECIAL_KEYS.map((k) => [k, false])), ...Object.fromEntries(on.map((k) => [k, true])) }) as unknown as SpecialRolesConfig;
const PAIR: DrawnPair = { civilWord: 'Pizza', undercoverWord: 'Burger', themeKey: 'classique', difficulty: 2 };
const rng = (seed: number) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

function play(seed: number, on: string[], mr: number): GameState {
  const r = rng(seed);
  const assign = assignRound({ names: Array.from({ length: 10 }, (_, i) => `J${i + 1}`), undercoverCount: 2, mrWhiteCount: mr, espionCount: 0, roles: roles(on), pair: PAIR, missions: { words: ['x'], missions: ['m'] }, rng: r });
  let s = gameReducer(initialGameState, { type: 'START', round: 1, assign, pair: PAIR });
  const d = (a: GameAction): void => { s = gameReducer(s, a); };
  for (const p of s.players) { d({ type: 'OPEN_CARD', id: p.id }); d({ type: 'CLOSE_CARD' }); }
  ok(s.players.every((p) => p.viewed), 'toutes les cartes vues');
  d({ type: 'START_VOTE' });
  let guard = 0;
  while (s.phase !== 'gameover' && guard++ < 200) {
    if (s.modal === 'none') { const t = alive(s)[Math.floor(r() * alive(s).length)]; if (!t) break; d({ type: 'ASK_ELIMINATE', id: t.id }); d({ type: 'CONFIRM_ELIMINATE' }); }
    else if (s.modal === 'announce') d({ type: 'ANNOUNCE_CONTINUE' });
    else if (s.modal === 'pick') { const t = alive(s)[0]; if (!t) break; d({ type: 'PICK_TARGET', id: t.id }); }
    else if (s.modal === 'guess') { if (s.guess.stage === 'asking') d({ type: 'GUESS_SUBMIT', value: r() < 0.3 ? 'Pizza' : 'raté' }); else d({ type: 'GUESS_CONTINUE' }); }
    else break;
  }
  return s;
}

for (let seed = 1; seed <= 400; seed++) {
  const s = play(seed, ['orion', 'prometheus', 'amoureux', 'fauxfrere', 'idiot', 'hercule', 'mytho'], seed % 2);
  ok(s.phase === 'gameover' && s.winner !== null, `seed ${seed} : la manche se termine avec un vainqueur`);
  ok(s.modal === 'none', `seed ${seed} : aucune modale résiduelle`);
}
console.log(`${n} vérifications, ${fail} échec(s).`);
process.exit(fail ? 1 : 0);
