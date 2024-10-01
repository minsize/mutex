type Release = (options?: { key: string }) => void
type Wait = (options?: { key: string; limit: number }) => Promise<Release>

type List = { l: number; r: Release[] }

type MutexOptions = {
  /**
   * Total request limit
   */
  globalLimit?: number
  /**
   * Maximum waiting time for a response
   */
  timeout?: number
}

type Mutex = (options?: MutexOptions) => { wait: Wait; release: Release }
const Mutex: Mutex = (globalOptions) => {
  const list = new Map<string, List>()
  let usedLimit = 0

  const wait: Wait = (options) => {
    return new Promise<Release>((resolve, reject) => {
      const request = list.get(`${options?.key}`) || { l: 0, r: [] }

      const failed =
        (options?.limit && request.l >= options.limit) ||
        usedLimit >= (globalOptions?.globalLimit || 1)

      const timer =
        failed && globalOptions?.timeout
          ? setTimeout(() => {
              const error: Error & { code?: number } = new Error("timeout")
              error.code = 1
              reject(error)
            }, globalOptions.timeout)
          : undefined

      const end = () =>
        resolve(() => {
          clearTimeout(timer)
          release(options)
        })

      if (failed) {
        request.r.push(end)
      }

      usedLimit++
      request.l++

      list.set(`${options?.key}`, request)
      if (!failed) {
        end()
      }
    })
  }

  const release: Release = (options) => {
    const request = list.get(`${options?.key}`)
    if (request) {
      if (request.r.length !== 0) request.r.shift()!(options)
      request.l--

      list.set(`${options?.key}`, request)
    }

    usedLimit--
  }

  return {
    wait,
    release,
  }
}

export { Mutex, type MutexOptions, type List, type Wait, type Release }
