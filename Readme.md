## SDK
[![npm version](https://img.shields.io/npm/v/minsize/mutex)](https://www.npmjs.com/package/minsize/mutex)

```
npm i @minsize/mutex

yarn add @minsize/mutex
```

### Usage
```js
import { Mutex } from '@minsize/mutex'

const mutex = Mutex({
    globalLimit: 1 // Global limit on how many functions a mutex can process at once
})

const fn = async () => {
    const release = await mutex.wait();

    try {
       // ...
    } finally {
        release();
        // or
        mutex.release();
    }
}

```


### Use with key
```js
import { Mutex } from '@minsize/mutex'

const mutex = Mutex({
    globalLimit
})

const fn = async (userId) => {
    const release = await mutex.wait({
        key: userId, // Whom Mutex will be used
        limit: 1 // Works the same as the global limit, but only for 1 key
    });

    try {
       // ...
    } finally {
        release();
        // or 
        mutex.release({ key: userId });
    }
}

```