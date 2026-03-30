export const LEVEL_PROGRESSION = [
  { level: 1, title: "Quiet Seed", xpRequired: 0 },
  { level: 2, title: "Tender Sprout", xpRequired: 46 },
  { level: 3, title: "Growing Root", xpRequired: 120 },
  { level: 4, title: "First Bloom", xpRequired: 250 },
  { level: 5, title: "Steady Branch", xpRequired: 450 },
  { level: 6, title: "Deep Root", xpRequired: 750 },
  { level: 7, title: "Open Canopy", xpRequired: 1200 },
  { level: 8, title: "Standing Tall", xpRequired: 1800 },
  { level: 9, title: "Ancient Oak", xpRequired: 2600 },
  { level: 10, title: "Living Forest", xpRequired: 3600 },
] as const

export function getLevelInfo(xp: number) {
  const current = LEVEL_PROGRESSION.findLast((l) => xp >= l.xpRequired)!
  const next = LEVEL_PROGRESSION.find((l) => l.xpRequired > xp)
  return {
    level: current.level,
    title: current.title,
    xp,
    xpToNext: next ? next.xpRequired - xp : 0,
    nextTitle: next?.title ?? "Max Level",
  }
}
