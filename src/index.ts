type Release = (params?: {
  key?: string
}) => void

type Wait = (params?: {
  key?: string
  limit?: number
}) => Promise<Release>

type Lists = Record<string, {
  limit: number
  waitings: {
    resolve: Release
  }[]
}>

type Mutex = (params?: {
  globalLimit?: number
}) => {
  wait: Wait,
  release: Release
}

const Mutex: Mutex = ({ globalLimit = 1 } = {}) => {
  const lists: Lists = {}
  let _globalLimit = 0;

  const wait: Wait = async ({ key = "", limit = 1 } = {}) => {
    if (!lists[key]) lists[key] = { limit: 0, waitings: [] }

    return await new Promise<Release>((_resolve) => {
      const resolve = () => _resolve(() => release({ key }))
      const list = lists[key]
      if (_globalLimit >= globalLimit || list.limit >= limit) {
        list.waitings.push({ resolve })
      } else {
        _globalLimit++
        list.limit++;
        resolve()
      }
    })
  }

  const release: Release = ({ key = "" } = {}) => {
    const list = lists[key]
    if (list.waitings.length > 0) {
      list.waitings.shift()?.resolve({ key });
      list.limit--;
      _globalLimit--;
    } else {
      list.limit = 0;
      _globalLimit = 0
    }
  }

  return { wait, release }
}

export { Mutex }