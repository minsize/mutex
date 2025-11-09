type Release = (options?: {
    key: string;
}) => void;
type Wait = (options?: {
    key: string;
    limit: number;
    index?: number;
}) => Promise<Release>;
/**
 * l = limit
 * r = requests
 * i = index
 */
type List = {
    l: number;
    r: [Release, number][];
};
type MutexOptions = {
    /**
     * Total request limit
     */
    globalLimit?: number;
    /**
     * Maximum waiting time for a response
     */
    timeout?: number;
};
type Mutex = (options?: MutexOptions) => {
    wait: Wait;
    release: Release;
    lock: () => void;
    unlock: () => void;
};
declare const Mutex: Mutex;

export { type List, Mutex, type MutexOptions, type Release, type Wait };
