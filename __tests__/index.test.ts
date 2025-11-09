import { Mutex } from "../dist"

describe("Mutex", () => {
  it("should allow a single request if no global limit is specified", async () => {
    const mutex = Mutex()
    const release1 = await mutex.wait()
    expect(release1).toBeDefined()
  })

  it("should allow multiple requests within the global limit", async () => {
    const mutex = Mutex({ globalLimit: 2 })
    const release1 = await mutex.wait()
    const release2 = await mutex.wait()
    expect(release1).toBeDefined()
    expect(release2).toBeDefined()
  })

  it("should allow multiple requests within the key-specific limit", async () => {
    const mutex = Mutex({ globalLimit: 2 })
    const release1 = await mutex.wait({ key: "test", limit: 2 })
    const release2 = await mutex.wait({ key: "test", limit: 2 })
    expect(release1).toBeDefined()
    expect(release2).toBeDefined()
  })

  it("should release the lock and allow subsequent requests", async () => {
    const mutex = Mutex({ globalLimit: 1 })
    const release1 = await mutex.wait()
    expect(release1).toBeDefined()
    release1()
    const release2 = await mutex.wait()
    expect(release2).toBeDefined()
    release2()
  })

  it("should release the lock and allow subsequent requests for specific key", async () => {
    const mutex = Mutex()
    const release1 = await mutex.wait({ key: "test", limit: 1 })
    expect(release1).toBeDefined()
    release1()
    const release2 = await mutex.wait({ key: "test", limit: 1 })
    expect(release2).toBeDefined()
    release2()
  })

  it("indexs", async () => {
    const mutex = Mutex()
    const order: number[] = []

    await Promise.all([
      new Promise(async (resolve) => {
        const release = await mutex.wait({ key: "1", limit: 1, index: 0 })
        order.push(1)
        release()
        resolve(true)
      }),
      new Promise(async (resolve) => {
        const release = await mutex.wait({ key: "1", limit: 1, index: 1 })
        order.push(3)
        release()
        resolve(true)
      }),
      new Promise(async (resolve) => {
        const release = await mutex.wait({ key: "1", limit: 1, index: 1 })
        order.push(4)
        release()
        resolve(true)
      }),
      new Promise(async (resolve) => {
        const release = await mutex.wait({ key: "1", limit: 1, index: 0 })
        order.push(2)
        release()
        resolve(true)
      }),
    ])
    expect(order).toEqual([1, 2, 3, 4])
  })

  it("should timeout waiting requests after the specified duration", async () => {
    const mutex = Mutex({ globalLimit: 1, timeout: 10 })
    let error
    const release1 = await mutex.wait()
    try {
      const release2 = await mutex.wait()
    } catch (err) {
      error = err
    }
    expect(error).toBeDefined()
  })

  it("mutex should enforce global and individual limits", async () => {
    const mutex = Mutex({ globalLimit: 1 }) // Глобальное ограничение - 1 для проверки очереди
    const order: number[] = []
    const promises = []
    for (let i = 0; i < 10; i++) {
      promises.push(
        new Promise<void>((resolve, reject) => {
          mutex.wait({ key: "test", limit: 1 }).then((release) => {
            setTimeout(() => {
              order.push(i) // Добавляем номер запроса в массив order
              release()
              resolve()
            }, 100 * i)
          })
        }),
      )
    }
    await Promise.all(promises)
    // Проверяем, что запросы выполнились в правильном порядке
    expect(order).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  // Новые тесты для lock/unlock функциональности

  describe("lock/unlock functionality", () => {
    it("should block all wait calls when locked", async () => {
      const mutex = Mutex({ globalLimit: 2 })
      const results: string[] = []

      mutex.lock()

      // Эти вызовы должны быть заблокированы
      const promise1 = mutex.wait().then(() => results.push("first"))
      const promise2 = mutex.wait().then(() => results.push("second"))

      // Даем время для выполнения, если бы не было блокировки
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(results).toEqual([]) // Ничего не должно выполниться

      mutex.unlock()

      await Promise.all([promise1, promise2])
      expect(results).toEqual(["first", "second"]) // Теперь должны выполниться
    })

    it("should process queued requests in order after unlock", async () => {
      const mutex = Mutex({ globalLimit: 1 })
      const order: string[] = []

      mutex.lock()

      // Создаем несколько заблокированных запросов
      const promises = [
        mutex.wait().then((release) => {
          order.push("first")
          release()
        }),
        mutex.wait().then((release) => {
          order.push("second")
          release()
        }),
        mutex.wait().then((release) => {
          order.push("third")
          release()
        }),
      ]

      // Даем время для выполнения, если бы не было блокировки
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(order).toEqual([]) // Ничего не должно выполниться

      mutex.unlock()

      await Promise.all(promises)
      expect(order).toEqual(["first", "second", "third"]) // Должны выполниться в порядке очереди
    })

    it("should work with key-specific limits after unlock", async () => {
      const mutex = Mutex({ globalLimit: 2 })
      const results: string[] = []

      mutex.lock()

      const promise1 = mutex.wait({ key: "test", limit: 1 }).then((release) => {
        results.push("key1")
        release()
      })
      const promise2 = mutex.wait({ key: "test", limit: 1 }).then((release) => {
        results.push("key2")
        release()
      })

      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(results).toEqual([])

      mutex.unlock()

      await Promise.all([promise1, promise2])
      expect(results).toEqual(["key1", "key2"])
    })

    it("should handle lock/unlock multiple times", async () => {
      const mutex = Mutex()
      const results: string[] = []

      // Первая блокировка
      mutex.lock()
      const promise1 = mutex.wait().then((release) => {
        results.push("first")
        release()
      })
      await new Promise((resolve) => setTimeout(resolve, 30))
      expect(results).toEqual([])
      mutex.unlock()

      await promise1
      expect(results).toEqual(["first"])

      // Вторая блокировка
      mutex.lock()
      const promise2 = mutex.wait().then((release) => {
        results.push("second")
        release()
      })
      await new Promise((resolve) => setTimeout(resolve, 30))
      expect(results).toEqual(["first"]) // second еще не должен быть добавлен
      mutex.unlock()

      await promise2
      expect(results).toEqual(["first", "second"])
    })

    it("should maintain existing functionality when not locked", async () => {
      const mutex = Mutex({ globalLimit: 1 })

      // Без блокировки все должно работать как раньше
      const release1 = await mutex.wait()
      expect(release1).toBeDefined()

      const waitPromise = mutex.wait()
      release1()

      const release2 = await waitPromise
      expect(release2).toBeDefined()
      release2()
    })
  })
})
