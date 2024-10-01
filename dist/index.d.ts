type Release = (options?: {
    key: string;
}) => void;
type Wait = (options?: {
    key: string;
    limit: number;
}) => Promise<Release>;
type List = {
    l: number;
    r: Release[];
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
};
declare const Mutex: Mutex;

export { type List, Mutex, type MutexOptions, type Release, type Wait };
