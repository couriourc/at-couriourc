export type FunctionOrValue<T, U = any> =
    ((...args: U[]) => T) |
    T;

export type MaybeFunction<T> = T extends (...args: any[]) => any ?
    Parameters<T>
    : never;

export function extraFunction<T>(fnLike: FunctionOrValue<T>, ...args: MaybeFunction<T>) {
    try {
        return (fnLike as Function)(...args)
    } catch {
        return fnLike;
    }
}

