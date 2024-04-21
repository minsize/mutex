type Release = (params?: {
    key: string;
}) => void;
type Wait = (params?: {
    key: string;
    limit: number;
}) => Promise<Release>;
type Reqs = Record<string, {
    l: number;
    w: {
        r: Release;
    }[];
}>;
type TMutex = (params?: {
    globalLimit: number;
}) => {
    wait: Wait;
    release: Release;
};
declare const Mutex: TMutex;

export { Mutex, type Release, type Reqs, type TMutex, type Wait };
