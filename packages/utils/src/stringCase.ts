

export function camelCase(str: string) {
    return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : "");
}

export function toCamelCase(str: string) {
    return str.substring(0, 1).toUpperCase() + str.substring(1, str.length);
}