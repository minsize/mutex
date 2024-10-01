type Release = (params?: { key: string }) => void

type Wait = (params?: { key: string; limit: number }) => Promise<Release>

type Reqs = Record<
  string,
  {
    l: number
    w: {
      r: Release
    }[]
  }
>

type TMutex = (params?: { globalLimit: number }) => {
  wait: Wait
  release: Release
}

const Mutex: TMutex = (a = { globalLimit: 1 }) => {
  const REQS: Reqs = {}
  let GLOBAL_LIMIT = 0

  /**
   * Adding to the waiting list
   */
  const wait: Wait = async (p = { key: "", limit: 1 }) => {
    return await new Promise<Release>((_resolve) => {
      const r = () => _resolve(() => release(p))
      const list = REQS[p.key] || (REQS[p.key] = { l: 0, w: [] })
      if (GLOBAL_LIMIT >= a.globalLimit || list.l >= p.limit) {
        list.w.push({ r })
      } else {
        GLOBAL_LIMIT++
        list.l++
        r()
      }
    })
  }

  /**
   * Removal from the waiting list
   */
  const release: Release = (p = { key: "" }) => {
    const list = REQS[p.key]
    if (list.w.length > 0) {
      list.w.shift()?.r(p)
      list.l--
      GLOBAL_LIMIT--
    } else {
      list.l = 0
      GLOBAL_LIMIT = 0
    }
  }

  return { wait, release }
}

export { Mutex, type TMutex, type Reqs, type Wait, type Release }
