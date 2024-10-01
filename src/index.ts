type Release = (options?: { key: string }) => void
type Wait = (options?: {
  key: string
  limit: number
  index?: number
}) => Promise<Release>

/**
 * l = limit
 * r = requests
 * i = index
 */
type List = { l: number; r: [Release, number][] }

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
  const list: Record<string, List | undefined> = {}
  let usedLimit = 0

  const wait: Wait = (options) => {
    return new Promise<Release>((resolve, reject) => {
      let request = list[`${options?.key}`]
      if (!request) {
        request = { l: 0, r: [] }
        list[`${options?.key}`] = request
      }

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

      if (failed) request.r.push([end, options?.index || 0])

      usedLimit++
      request.l++

      if (!failed) end()
    })
  }

  const release: Release = (options) => {
    const request = list[`${options?.key}`]
    if (request) {
      if (request.r.length !== 0) {
        request.r
          .sort((a, b) => a[1] - b[1])
          .shift()?.[0](options)
      }
      request.l--
    }
    usedLimit--
  }

  return {
    wait,
    release,
  }
}

export { Mutex, type MutexOptions, type List, type Wait, type Release }
