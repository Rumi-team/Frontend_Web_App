import { describe, it, expect } from "vitest"
import { getLevelInfo, LEVEL_PROGRESSION } from "@/lib/levels"

describe("getLevelInfo", () => {
  it("returns level 1 for xp=0", () => {
    const info = getLevelInfo(0)
    expect(info.level).toBe(1)
    expect(info.title).toBe("Quiet Seed")
    expect(info.xpToNext).toBe(46)
    expect(info.nextTitle).toBe("Tender Sprout")
  })

  it("returns level 2 at boundary (xp=46)", () => {
    const info = getLevelInfo(46)
    expect(info.level).toBe(2)
    expect(info.title).toBe("Tender Sprout")
    expect(info.xpToNext).toBe(74) // 120 - 46
    expect(info.nextTitle).toBe("Growing Root")
  })

  it("returns level 1 just below boundary (xp=45)", () => {
    const info = getLevelInfo(45)
    expect(info.level).toBe(1)
    expect(info.title).toBe("Quiet Seed")
    expect(info.xpToNext).toBe(1)
  })

  it("handles mid-level xp (xp=100)", () => {
    const info = getLevelInfo(100)
    expect(info.level).toBe(2)
    expect(info.title).toBe("Tender Sprout")
    expect(info.xpToNext).toBe(20) // 120 - 100
  })

  it("returns max level for xp >= 3600", () => {
    const info = getLevelInfo(3600)
    expect(info.level).toBe(10)
    expect(info.title).toBe("Living Forest")
    expect(info.xpToNext).toBe(0)
    expect(info.nextTitle).toBe("Max Level")
  })

  it("returns max level for xp way above max (xp=10000)", () => {
    const info = getLevelInfo(10000)
    expect(info.level).toBe(10)
    expect(info.xpToNext).toBe(0)
  })

  it("progression table has 10 levels", () => {
    expect(LEVEL_PROGRESSION).toHaveLength(10)
  })

  it("progression table is sorted by xpRequired ascending", () => {
    for (let i = 1; i < LEVEL_PROGRESSION.length; i++) {
      expect(LEVEL_PROGRESSION[i].xpRequired).toBeGreaterThan(
        LEVEL_PROGRESSION[i - 1].xpRequired
      )
    }
  })
})
