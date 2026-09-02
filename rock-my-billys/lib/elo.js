// Elo-based ranking engine for Rock My Billys pool league.

const BASE_K = 32;

// How dramatically each type of win/loss should swing the ratings.
export const WIN_TYPE_MULTIPLIERS = {
  NORMAL: 1.0, // standard win, went the distance
  SUNK_8_BALL: 1.25, // decisive, clean win on the 8 ball
  WHITEWASH: 1.5, // total domination, opponent got nothing
  FORFEIT: 0.5, // no-show / forfeit, barely counts
};

export const WIN_TYPE_LABELS = {
  NORMAL: "Standard Win",
  SUNK_8_BALL: "Sunk the 8-Ball",
  WHITEWASH: "Whitewash",
  FORFEIT: "Forfeit",
};

// Standard elo expected-score formula
export function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Compute new ratings after a match.
 * @param {number} winnerElo
 * @param {number} loserElo
 * @param {string} winType - key of WIN_TYPE_MULTIPLIERS
 * @returns {{winnerNewElo:number, loserNewElo:number, winnerChange:number, loserChange:number, winnerWasFavorite:boolean, winnerWinProbability:number}}
 */
export function computeEloChange(winnerElo, loserElo, winType = "NORMAL") {
  const multiplier = WIN_TYPE_MULTIPLIERS[winType] ?? 1.0;
  const k = BASE_K * multiplier;

  const winnerExpected = expectedScore(winnerElo, loserElo);
  const loserExpected = 1 - winnerExpected;

  const winnerChangeRaw = k * (1 - winnerExpected);
  const loserChangeRaw = k * (0 - loserExpected);

  const winnerChange = Math.round(winnerChangeRaw);
  const loserChange = Math.round(loserChangeRaw);

  return {
    winnerNewElo: winnerElo + winnerChange,
    loserNewElo: Math.max(0, loserElo + loserChange),
    winnerChange,
    loserChange,
    winnerWasFavorite: winnerElo >= loserElo,
    winnerWinProbability: winnerExpected, // pre-match odds the winner had of winning
  };
}

// Rank tiers, highest first. Thresholds are inclusive lower bounds.
export const TIERS = [
  { name: "Master", min: 1300 },
  { name: "Expert", min: 1200 },
  { name: "Veteran", min: 1100 },
  { name: "Advanced", min: 1000 },
  { name: "Intermediate", min: 900 },
  { name: "Novice", min: -Infinity },
];

export function tierForElo(elo) {
  for (const tier of TIERS) {
    if (elo >= tier.min) return tier.name;
  }
  return "Novice";
}

/**
 * Given a list of users sorted by elo descending, decorate them with
 * position, tier, and special title (Caesar for #1, Boots for last).
 */
export function decorateStandings(usersSortedByEloDesc) {
  return usersSortedByEloDesc.map((u, idx) => {
    const position = idx + 1;
    const tier = tierForElo(u.elo);
    let title = tier;
    if (usersSortedByEloDesc.length > 1) {
      if (position === 1) title = "Caesar";
      else if (position === usersSortedByEloDesc.length) title = "Boots";
    }
    return { ...u, position, tier, title };
  });
}
