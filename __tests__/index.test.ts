import { Mutex } from "../dist"

test("test_1", async () => {
  const mutex = Mutex();

  let count = 0;
  for (var i = 0; i < 10; i++) {
    const relase = await mutex.wait()
    count++
    setTimeout(relase, 100)
  }
  expect(count === 10).toBe(true)
})

test("test_2", async () => {
  const mutex = Mutex();

  let count = 0;

  const relase = await mutex.wait({ key: "id", limit: 1 })
  count++
  setTimeout(relase, 2000)
  const relase2 = await mutex.wait({ key: "id", limit: 1 })
  count++

  expect(count === 2).toBe(true)
})