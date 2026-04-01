import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Mock localStorage before importing the store
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (i: number) => Object.keys(store)[i] ?? null,
  }
})()
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock })

// Mock fetch
vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }))

const { useSettingsStore, cancelPendingSave } = await import("@/store/settingsStore")

describe("settingsStore debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(fetch).mockClear()
    localStorageMock.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("setField triggers debounced save after 1500ms", () => {
    useSettingsStore.getState().setField("selectedVoice", "Puck")

    expect(fetch).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1500)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      "/api/user/settings",
      expect.objectContaining({ method: "PATCH" })
    )
  })

  it("rapid setField calls coalesce into single save", () => {
    useSettingsStore.getState().setField("selectedVoice", "Puck")
    useSettingsStore.getState().setField("aiStyle", "gentle")
    useSettingsStore.getState().setField("selectedTheme", "sunset_sky")

    vi.advanceTimersByTime(1500)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("cancelPendingSave prevents the debounced save from firing", () => {
    useSettingsStore.getState().setField("selectedVoice", "Fenrir")

    cancelPendingSave()

    vi.advanceTimersByTime(2000)
    expect(fetch).not.toHaveBeenCalled()
  })
})
