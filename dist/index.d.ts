type Release = (params?: {
    key?: string;
}) => void;
type Wait = (params?: {
    key?: string;
    limit?: number;
}) => Promise<Release>;
type Mutex = (params?: {
    globalLimit?: number;
}) => {
    wait: Wait;
    release: Release;
};
declare const Mutex: Mutex;

export { Mutex as default };
