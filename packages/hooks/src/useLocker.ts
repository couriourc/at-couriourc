interface Locker {
    lock(): boolean;

    unlock(): boolean;

    is_lock(): boolean;
}


type NoLockerFunction<T> = T extends (locker: Locker, ...args: (infer P)) => any ? P : T;

/**
 * @description 为函数加锁，第一个参数提供了加锁方式，
 * */
export function useLocker<
    T extends (locker: Locker, ...args: any[]) => any
>(fn: T): (...args: NoLockerFunction<T>) =>
    ReturnType<T> {
    let _lock: boolean = false;

    function lock() {
        return _lock = true;
    }

    function unlock() {
        return _lock = false;
    }

    function is_lock() {
        return _lock;
    }

    return function (...args: NoLockerFunction<T>) {
        if (is_lock()) {
            return;
        }
        try {
            return fn({
                lock, unlock, is_lock,
                /*@ts-ignore*/
            }, ...args);
        } finally {
            unlock();
        }
    };

}
