/**
 * Tests du domaine pur (aucune dépendance). Lancement :
 *   npm run test:domain
 * Les valeurs attendues viennent du readme de l'application d'origine.
 */
import words from '../src/data/words.json';
import missionsFile from '../src/data/missions.json';
import {
  assignRound, buildCsv, buildScoreEntry, computeStats, decodeShared, deadlockRuleActive, eliminate,
  encodeShared, isCorrectGuess, isImpostor, makeTiresiasHint, maxImpostors, mergeCustomPairs,
  parseWordsFile, pickWordPair, recommendedImpostors, recommendedUndercovers, resolveElimination,
  specialLabels, describeCard, gameOverText, checkBalance, SPECIAL_KEYS,
  type DrawnPair, type Player, type SpecialRolesConfig, type WordPair, type GameSettings,
} from '../src/domain';

declare const process: { exit(code: number): never };
declare const console: { error(...args: unknown[]): void; log(...args: unknown[]): void };

let failures = 0;
let checks = 0;
function eq<T>(actual: T, expected: T, label: string): void {
  checks += 1;
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    failures += 1;
    console.error(`✗ ${label}\n    attendu : ${e}\n    obtenu  : ${a}`);
  }
}
function ok(cond: boolean, label: string): void {
  checks += 1;
  if (!cond) {
    failures += 1;
    console.error(`✗ ${label}`);
  }
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NO_ROLES = Object.fromEntries(SPECIAL_KEYS.map((k) => [k, false])) as unknown as Record<string, boolean>;
const roles = (on: readonly string[] = []): SpecialRolesConfig =>
  ({ ...NO_ROLES, ...Object.fromEntries(on.map((k) => [k, true])) }) as unknown as SpecialRolesConfig;
const PAIR: DrawnPair = { civilWord: 'Pizza', undercoverWord: 'Burger', themeKey: 'classique', difficulty: 2 };
const POOL = { words: missionsFile.words, missions: missionsFile.missions };
const names = (n: number): string[] => Array.from({ length: n }, (_, i) => `J${i + 1}`);

/* 1 — Équilibrage : table du readme */
const table: Array<[number, number, number]> = [[3, 6, 1], [7, 10, 2], [11, 14, 3], [15, 18, 4], [19, 20, 5]];
for (const [lo, hi, expected] of table) {
  for (let n = lo; n <= hi; n++) eq(recommendedImpostors(n), expected, `imposteurs recommandés pour ${n} joueurs`);
}
eq([3, 4, 5, 6, 7, 8, 20].map(maxImpostors), [1, 1, 2, 2, 3, 3, 9], 'plafond ⌈n/2⌉−1, au moins 1');
eq(recommendedUndercovers({ playerCount: 12, mrWhiteCount: 1, espionCount: 0, roles: { fauxfrere: true, judas: false } }), 1, 'Undercovers auto : décompte Mr. White + Faux-Frère');

/* 2 — Tirésias (exemples du readme) */
eq(makeTiresiasHint('Pomme de terre'), { prefix: 'Po', count: 12 }, 'Tirésias : Pomme de terre');
eq(makeTiresiasHint("L'été"), { prefix: "L'é", count: 4 }, "Tirésias : L'été garde les caractères d'origine");
eq(makeTiresiasHint('Zoo'), { prefix: 'Z', count: 3 }, 'Tirésias : 3 lettres ou moins → 1 seule lettre');

/* 3 — Dernière chance de Mr. White */
ok(isCorrectGuess("l'éthique", 'Éthique', 'Morale'), 'guess : ignore casse, accents et articles');
ok(isCorrectGuess('pommes', 'Pomme', 'Poire'), 'guess : pluriel toléré');
ok(!isCorrectGuess('Paris', 'Pari', 'Paris'), 'guess : donner le mot de l\'Undercover échoue');
ok(!isCorrectGuess('Pari', 'Paris', 'Pari'), 'guess : idem dans l\'autre sens');
ok(!isCorrectGuess('', 'Pizza', 'Burger'), 'guess : vide refusé');

/* 4 — Données words.json */
const themes = parseWordsFile(words);
eq(themes.length, 7, '7 thèmes');
const all = themes.flatMap((t) => t.pairs);
eq(all.length, 596, '596 paires');
eq([1, 2, 3].map((d) => all.filter((p) => p[2] === d).length), [130, 227, 239], 'répartition 130 / 227 / 239');
eq(themes.find((t) => t.key === 'classique')?.pairs.length, 273, 'thème Général : 273 paires');

/* 5 — Tirage sans répétition + replis */
{
  const small = [{ key: 'classique', label: 'G', desc: '', pairs: [['a', 'b', 1], ['c', 'd', 1]] as WordPair[] }];
  const rng = mulberry32(7);
  const r1 = pickWordPair({ themes: small, selectedKeys: ['classique'], difficulty: 0, used: {}, rng });
  const r2 = pickWordPair({ themes: small, selectedKeys: ['classique'], difficulty: 0, used: r1?.used ?? {}, rng });
  ok(!!r1 && !!r2 && r1.pair.civilWord + r1.pair.undercoverWord !== r2.pair.civilWord + r2.pair.undercoverWord, 'tirage : jamais deux fois la même paire');
  const r3 = pickWordPair({ themes: small, selectedKeys: ['classique'], difficulty: 0, used: r2?.used ?? {}, rng });
  ok(!!r3 && r3.notices.some((n) => n.includes('repart à zéro')), 'tirage : stock remis à zéro quand épuisé');
  const r4 = pickWordPair({ themes: small, selectedKeys: ['classique'], difficulty: 3, used: {}, rng });
  ok(!!r4 && r4.notices.some((n) => n.includes('toutes les difficultés')), 'tirage : repli si aucune paire de cette difficulté');
}

/* 6 — Attribution : invariants sur 300 manches aléatoires */
const ALL_ROLES = roles([...SPECIAL_KEYS]);
for (let seed = 1; seed <= 300; seed++) {
  const rng = mulberry32(seed);
  const n = 8 + (seed % 13); // 8..20
  const res = assignRound({ names: names(n), undercoverCount: 2, mrWhiteCount: 1, espionCount: 1, roles: ALL_ROLES, pair: PAIR, missions: POOL, rng });
  const ps = res.players;
  const impostors = ps.filter(isImpostor);
  ok(impostors.length <= maxImpostors(n) && impostors.some((p) => p.baseRole === 'undercover'), `seed ${seed} : plafond d'imposteurs et ≥ 1 Undercover`);
  // Chaque rôle « exclusif » va à un joueur distinct.
  const exclusive = ps.map((p) => [p.idiot, p.mytho, p.janus, p.voyeur, p.tiresias, p.orion, p.prometheus, p.hercule, p.traitor !== null, p.twin !== null, p.fantome, p.mime, p.procureur, p.loverId !== null].filter(Boolean).length);
  ok(exclusive.every((c) => c <= 1), `seed ${seed} : au plus un rôle spécial par joueur`);
  // Voyeur : 3 noms, dont exactement 1 vrai imposteur, jamais lui-même.
  const voyeur = ps.find((p) => p.voyeur);
  if (voyeur) {
    const real = voyeur.voyeurNames.filter((nm) => ps.find((p) => p.name === nm && isImpostor(p)));
    ok(voyeur.voyeurNames.length === 3 && real.length === 1 && !voyeur.voyeurNames.includes(voyeur.name), `seed ${seed} : Voyeur = 3 noms dont 1 imposteur`);
  }
  // Jumeaux / Amoureux : liens réciproques, jamais imposteur pour les jumeaux.
  for (const p of ps) {
    if (p.twin) {
      const t = ps[p.twin.partnerId];
      ok(!!t?.twin && t.twin.partnerId === p.id && !isImpostor(p) && !isImpostor(t), `seed ${seed} : Jumeaux réciproques et civils`);
    }
    if (p.loverId !== null) ok(ps[p.loverId]?.loverId === p.id, `seed ${seed} : Amoureux réciproques`);
    if (p.hercule) ok(p.mission.length > 0 && !p.mission.includes('{mot}'), `seed ${seed} : mission Hercule renseignée`);
    if (p.traitor === 'judas') ok(ps.some((x) => isImpostor(x) && x.name === p.judasKnows), `seed ${seed} : Judas connaît un vrai imposteur`);
    if (p.baseRole === 'mrwhite' || p.baseRole === 'espion') ok(p.word === '', `seed ${seed} : pas de mot pour Mr. White / Espion`);
  }
}
{
  // Trop peu de joueurs : les rôles manquants sont signalés, sans planter.
  const res = assignRound({ names: names(3), undercoverCount: 1, mrWhiteCount: 0, espionCount: 0, roles: ALL_ROLES, pair: PAIR, missions: POOL, rng: mulberry32(3) });
  ok(res.warnings.length > 0, 'à 3 joueurs avec tous les rôles : avertissements générés');
  const noMissions = assignRound({ names: names(10), undercoverCount: 2, mrWhiteCount: 0, espionCount: 0, roles: roles(['hercule']), pair: PAIR, missions: null, rng: mulberry32(5) });
  ok(noMissions.warnings.some((w) => w.kind === 'missions-unavailable') && !noMissions.players.some((p) => p.hercule), 'Hercule non attribué sans missions');
}

/* 7 — Élimination et victoire */
function base(n: number, over: Record<number, Partial<Player>> = {}): Player[] {
  const res = assignRound({ names: names(n), undercoverCount: 1, mrWhiteCount: 0, espionCount: 0, roles: roles(), pair: PAIR, missions: null, rng: mulberry32(1) });
  // On neutralise l'aléa : J1 est l'Undercover, tous les autres sont Civils.
  return res.players.map((p) => ({ ...p, baseRole: p.id === 0 ? 'undercover' : 'civil', word: p.id === 0 ? 'Burger' : 'Pizza', ...over[p.id] }) as Player);
}
const resolve = (ps: readonly Player[], id: number, ctx: { fromVote?: boolean; voteCount?: number } = {}) => {
  const out = eliminate(ps, id);
  return { out, res: resolveElimination(out.players, out.victims, { fromVote: ctx.fromVote ?? true, voteCount: ctx.voteCount ?? 1, earlier: [] }) };
};

eq(resolve(base(6), 0).res.winner, 'civils', 'éliminer l\'Undercover → les Civils gagnent');
eq(resolve(base(6), 3).res.winner, null, 'éliminer un Civil parmi 6 → la partie continue');
{
  // 3 joueurs : Undercover + 2 Civils ; un Civil tombe → 2 restants dont un imposteur → impasse.
  const r = resolve(base(3), 1);
  eq([r.res.winner, r.res.winnerReason], ['undercover', 'deadlock2'], 'impasse à 2 joueurs → les imposteurs gagnent');
}
{
  const ps = base(5, { 2: { fantome: true } });
  ok(!deadlockRuleActive(ps), 'un Fantôme en jeu désactive la règle d\'impasse');
  eq(resolve(ps, 1).res.winner, null, 'avec Fantôme : pas d\'impasse à 2 joueurs restants… (3 restants ici)');
}
{
  const ps = base(6, { 4: { idiot: true } });
  eq(resolve(ps, 4, { voteCount: 1 }).res.winner, 'idiot', 'Idiot éliminé au 1er vote → il gagne seul');
  eq(resolve(ps, 4, { voteCount: 2 }).res.winner, null, 'Idiot éliminé au 2e vote → rien de spécial');
  eq(resolve(ps, 4, { voteCount: 1, fromVote: false }).res.winner, null, 'Idiot tué par un tir d\'Orion → pas de victoire d\'Idiot');
}
{
  const ps = base(8, { 2: { loverId: 3 }, 3: { loverId: 2 } });
  const r = resolve(ps, 2);
  eq(r.out.victims.map((p) => p.id), [2, 3], 'Amoureux : le/la partenaire suit dans l\'élimination');
}
{
  const ps = base(5, { 1: { loverId: 2 }, 2: { loverId: 1 } });
  const e1 = eliminate(ps, 0).players; // Undercover tombe
  const e2 = eliminate(e1, 3).players;
  const e3 = eliminate(e2, 4);
  eq(resolveElimination(e3.players, e3.victims, { fromVote: true, voteCount: 3, earlier: [] }).winner, 'amoureux', 'Amoureux derniers survivants → victoire');
}
{
  // 8 joueurs, Undercover (0) et couple (2,3) en vie : on élimine 4, 5, 6 puis 7 → il reste 4 joueurs.
  const ps = base(8, { 2: { loverId: 3 }, 3: { loverId: 2 } });
  const stage = [4, 5, 6].reduce((acc, id) => eliminate(acc, id).players, ps as readonly Player[]);
  const r = eliminate(stage, 7);
  const res4 = resolveElimination(r.players, r.victims, { fromVote: true, voteCount: 4, earlier: [] });
  eq([res4.winner, res4.winnerReason], ['amoureux', 'deadlock4'], 'impasse à 4 joueurs dont un couple → Amoureux');
}
{
  const ps = base(6, { 3: { orion: true } });
  const r = resolve(ps, 3);
  eq(r.res.orionPending?.id, 3, 'Orion éliminé → tir en attente (aucune victoire évaluée)');
  // Tir sur l'Undercover : la victoire est évaluée APRÈS le tir.
  const shot = eliminate(r.out.players.map((p) => (p.id === 3 ? { ...p, orionDone: true } : p)), 0);
  const after = resolveElimination(shot.players, shot.victims, { fromVote: false, voteCount: 1, earlier: r.res.chain });
  eq(after.winner, 'civils', 'tir d\'Orion sur l\'Undercover → Civils gagnent');
}
{
  const ps = base(7, { 3: { baseRole: 'mrwhite' } });
  const r = resolve(ps, 3);
  eq(r.res.guessQueue.map((p) => p.id), [3], 'Mr. White éliminé → dernière chance');
  const idiotAndWhite = base(7, { 3: { baseRole: 'mrwhite', idiot: true } });
  eq(resolve(idiotAndWhite, 3).res.guessQueue.length, 0, 'victoire de l\'Idiot → pas de dernière chance');
}
{
  const ps = base(7, { 4: { traitor: 'fauxfrere' } });
  const r = resolve(ps, 0);
  eq([r.res.winner, r.res.traitorStillHidden], [null, true], 'Faux-Frère vivant → les Civils ne gagnent pas encore');
  eq(resolve(eliminate(ps, 0).players, 4).res.winner, 'civils', 'Faux-Frère éliminé après les imposteurs → Civils');
}
{
  const ps = base(7, { 5: { prometheus: true } });
  eq(resolve(ps, 5).res.prometheusPending?.id, 5, 'Prométhée éliminé, partie en cours → désigne un joueur');
}

/* 8 — Carte secrète & texte de fin */
{
  const res = assignRound({ names: names(10), undercoverCount: 2, mrWhiteCount: 0, espionCount: 0, roles: roles(['tiresias', 'janus']), pair: PAIR, missions: null, rng: mulberry32(11) });
  const ctx = { players: res.players, showRole: false, civilWordHint: res.civilWordHint };
  const tir = res.players.find((p) => p.tiresias);
  const jan = res.players.find((p) => p.janus);
  ok(!!tir && describeCard(tir, ctx).roleLine.includes('commence par'), 'carte Tirésias : rôle toujours affiché même si masqué');
  ok(!!jan && describeCard(jan, ctx).wordText.includes('\n'), 'carte Janus : deux mots sur deux lignes');
  const civil = res.players.find((p) => p.baseRole === 'civil' && specialLabels(p).length === 0);
  ok(!!civil && describeCard(civil, ctx).roleLine === '', 'option « Tu es [rôle] » désactivée → ligne masquée pour un Civil');
  eq(gameOverText('civils', null, '', res.players, 'Pizza').title, 'Les Civils ont gagné !', 'titre de fin avec accent (corrige « gagne »)');
}

/* 9 — Journal, stats, exports */
{
  const ps = base(5);
  const done = eliminate(ps, 0);
  const entry = buildScoreEntry({ players: done.players, winner: 'civils', winnerPlayerId: null, round: 1, theme: 'classique', pairDifficulty: 2, groups: [], now: new Date('2026-10-30T10:00:00Z') });
  eq([entry.winnerNames.length, entry.players.filter((p) => p.won).length], [4, 4], 'journal : 4 vainqueurs (les Civils)');
  const e2 = { ...entry, players: entry.players.map((p) => ({ ...p, won: p.name === 'J2' })), winnerNames: ['J2'] };
  const stats = computeStats([e2, entry]); // plus récent d'abord
  eq(stats.byPlayer['J2']?.wins, 2, 'stats : victoires cumulées');
  eq(stats.byPlayer['J2']?.best, 2, 'stats : record de série');
  const csv = buildCsv([entry]);
  ok(csv.startsWith('\uFEFF') && csv.includes('\r\n') && csv.split('\r\n')[0]?.includes(';') === true, 'CSV : BOM UTF-8, CRLF, séparateur « ; »');
}

/* 10 — Paires personnalisées et lien de partage */
{
  const pairs: WordPair[] = [['Café', 'Thé', 1], ['Œuf', 'Poule ✨', 3]];
  eq(decodeShared(encodeShared(pairs)), pairs, 'partage : aller-retour base64url (accents, œ, emoji)');
  ok(decodeShared('%%%') === null, 'partage : code invalide → null');
  const m = mergeCustomPairs([['Chat', 'Chien', 2]], [['chien', 'CHAT'], ['A', 'A'], ['Lune', 'Soleil', 1], 'x']);
  eq([m.added, m.ignored], [1, 3], 'fusion : doublon (ordre/casse), invalide et non-paire ignorés');
}

/* 11 — Équilibrage : messages */
{
  const settings = {
    playerCount: 4, undercoverCount: 1, mrWhiteCount: 1, espionCount: 0, autoUndercover: true, roles: roles(['idiot']),
    selectedThemes: {}, difficulty: 0, difficultyLevel: 2, privacy: 'standard', autoHideSec: 8, showRole: true,
    timerEnabled: false, timerDurationMin: 3, timerSound: true,
  } as GameSettings;
  ok(checkBalance(settings, names(4)).some((i) => i.text.startsWith('À 4 joueurs ou moins')), 'équilibrage : avertissement à 4 joueurs');
  ok(checkBalance({ ...settings, playerCount: 6 }, ['A', 'a', 'B', 'C', 'D', 'E']).some((i) => i.text.includes('même nom')), 'équilibrage : noms en double détectés');
}

console.log(`\n${checks} vérifications, ${failures} échec(s).`);
process.exit(failures === 0 ? 0 : 1);
