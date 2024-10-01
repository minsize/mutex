const t = (t) => {
  const e = {}
  let o = 0
  const i = (t) => {
    const i = e[`${t?.key}`]
    i &&
      (0 !== i.r.length &&
        i.r
          .sort((t, e) => t[1] - e[1])
          .shift()?.[0](t),
      i.l--),
      o--
  }
  return {
    wait: (r) =>
      new Promise((l, s) => {
        let n = e[`${r?.key}`]
        n || ((n = { l: 0, r: [] }), (e[`${r?.key}`] = n))
        const m = (r?.limit && n.l >= r.limit) || o >= (t?.globalLimit || 1),
          c =
            m && t?.timeout
              ? setTimeout(() => {
                  const t = new Error("timeout")
                  ;(t.code = 1), s(t)
                }, t.timeout)
              : void 0,
          u = () =>
            l(() => {
              clearTimeout(c), i(r)
            })
        m && n.r.push([u, r?.index || 0]), o++, n.l++, m || u()
      }),
    release: i,
  }
}
export { t as Mutex }
