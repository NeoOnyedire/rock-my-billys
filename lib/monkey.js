// The Monkey. Mascot of Rock My Billys. He is mean, he calls everyone
// a monkey/ape/chimp, and he judges every result against your rank.
// This module produces two short lines per fixture: one aimed at the
// winner, one aimed at the loser, based on the odds, the win type,
// and the rank gap between the two "monkeys".

import { WIN_TYPE_LABELS } from "./elo";

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const NAMES_FOR_PLAYER = ["monkey", "chimp", "ape", "primate", "baboon", "banana-brain"];

function ref() {
  return pick(NAMES_FOR_PLAYER);
}

// --- WINNER lines, bucketed by how surprising the win was ---

const WINNER_HUGE_UPSET = [
  "WHAT. A monkey ranked that low actually won something. Even the trees are shaking.",
  "Somebody hide the bananas, {winner} just pulled off a miracle nobody saw coming.",
  "Hold on, let the record show a certified underdog {ref} just took this one. Don't get used to it.",
  "Blind squirrel finds a nut. {winner} finds a win. Enjoy it, it won't happen again.",
];

const WINNER_EXPECTED = [
  "This is exactly what we expected from a {ref} of your rank, {winner}. Try losing for once, it'd be more interesting.",
  "{winner} won. Groundbreaking. Truly the least surprising result of the century.",
  "Yeah, yeah, {winner} was supposed to win that. Save the celebration, {ref}.",
  "Big rank beats small rank, water is wet, {winner} wins. Riveting stuff.",
];

const WINNER_CLOSE = [
  "Scrappy win, {winner}. Not pretty, barely a win at all really, but I'll allow it, {ref}.",
  "That was closer than it should've been. Get your act together next time, {ref}.",
  "A win's a win I guess, {winner}, even an ugly one from a mid-table {ref}.",
];

const WINNER_FORFEIT = [
  "{winner} 'won' by forfeit. Congrats on beating an empty table, {ref}. Truly heroic.",
  "A forfeit win. The lowest form of victory a {ref} can claim. Barely counts, but I'll write it down.",
];

const WINNER_WHITEWASH = [
  "{winner} didn't just win, this {ref} embarrassed someone in front of the whole troop. Brutal.",
  "A total whitewash from {winner}. The other monkey should be ashamed to show its face at the table again.",
];

const WINNER_STREAK = [
  " And that's {streak} in a row now. Someone throw this {ref} an extra banana.",
  " {streak}-win streak. Getting cocky is a good way to end up back at the bottom, {ref}.",
];

// --- LOSER lines ---

const LOSER_HUGE_UPSET = [
  "Oops, what happened to you, {loser}? Losing to THAT {ref}? Rough day at the zoo.",
  "{loser} just got humbled by a much lower-ranked chimp. That one's going to sting for a while.",
  "A monkey your rank losing to that? Everyone saw it. Everyone's talking about it, {loser}.",
];

const LOSER_EXPECTED = [
  "{loser} lost to a favorite. Shocking absolutely nobody, least of all me.",
  "Yeah that one was coming, {loser}. Better luck next time, {ref}.",
  "Exactly as predicted. {loser} falls to the higher-ranked monkey. Try harder.",
];

const LOSER_CLOSE = [
  "So close, {loser}. Almost had it. Almost isn't a banana though, is it.",
  "Tight match, {loser}, but a loss is a loss in this jungle.",
];

const LOSER_FORFEIT = [
  "{loser} forfeited. Couldn't even show up. Weakest kind of {ref} there is.",
  "A forfeit loss for {loser}. Did the table scare you off, or was it something else?",
];

const LOSER_WHITEWASH = [
  "{loser} got completely wiped out. Whitewashed. Zero dignity left, {ref}.",
  "That wasn't a loss for {loser}, that was a public execution. Yikes.",
];

const LOSER_STREAK = [
  " That's {streak} losses in a row now. Might want to sit this one out, {ref}.",
];

function fillTemplate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

/**
 * @param {Object} params
 * @param {string} params.winnerName
 * @param {string} params.loserName
 * @param {number} params.winProbability - winner's pre-match win probability (0-1)
 * @param {string} params.winType - NORMAL | SUNK_8_BALL | WHITEWASH | FORFEIT
 * @param {number} params.winnerStreakAfter - winner's win streak count after this match
 * @param {number} params.loserStreakAfter - loser's loss streak count after this match (positive number of consecutive losses)
 */
export function generateMonkeyCommentary({
  winnerName,
  loserName,
  winProbability,
  winType = "NORMAL",
  winnerStreakAfter = 0,
  loserStreakAfter = 0,
}) {
  const vars = { winner: winnerName, loser: loserName, ref: ref() };

  let winnerPool;
  let loserPool;

  if (winType === "FORFEIT") {
    winnerPool = WINNER_FORFEIT;
    loserPool = LOSER_FORFEIT;
  } else if (winProbability <= 0.35) {
    winnerPool = WINNER_HUGE_UPSET;
    loserPool = LOSER_HUGE_UPSET;
  } else if (winProbability >= 0.65) {
    winnerPool = WINNER_EXPECTED;
    loserPool = LOSER_EXPECTED;
  } else {
    winnerPool = WINNER_CLOSE;
    loserPool = LOSER_CLOSE;
  }

  // Whitewash overrides the "close" bucket flavor since it's about
  // dominance regardless of pre-match odds.
  if (winType === "WHITEWASH" && winProbability > 0.35 && winProbability < 0.65) {
    winnerPool = WINNER_WHITEWASH;
    loserPool = LOSER_WHITEWASH;
  }

  let winnerMessage = fillTemplate(pick(winnerPool), vars);
  let loserMessage = fillTemplate(pick(loserPool), vars);

  if (winType === "WHITEWASH") {
    winnerMessage += " " + fillTemplate(pick(WINNER_WHITEWASH), vars);
  }

  if (winnerStreakAfter >= 3) {
    winnerMessage += fillTemplate(pick(WINNER_STREAK), { ...vars, streak: winnerStreakAfter });
  }
  if (loserStreakAfter >= 3) {
    loserMessage += fillTemplate(pick(LOSER_STREAK), { ...vars, streak: loserStreakAfter });
  }

  winnerMessage += ` (${WIN_TYPE_LABELS[winType] || winType})`;

  return { winnerMessage, loserMessage };
}

// A rotating idle taunt for the dashboard / nav, unrelated to any specific match.
const IDLE_TAUNTS = [
  "Welcome back, monkey. Try not to embarrass yourself today.",
  "The jungle never forgets a bad loss. Neither do I.",
  "Rankings update after every game. No hiding in the trees.",
  "Ceasar didn't get there by being scared of the table. What's your excuse?",
  "Boots is one bad matchday away from being someone else. Watch your back.",
  "Every monkey thinks they're the best monkey. Most are wrong.",
];

export function getIdleTaunt() {
  return pick(IDLE_TAUNTS);
}
