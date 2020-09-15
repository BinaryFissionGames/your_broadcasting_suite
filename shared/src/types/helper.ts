export function hasAndIsOfType(obj: { [key: string]: any }, prop: string, type: 'number' | 'boolean' | 'string') {
    return (obj[prop] !== undefined) && typeof obj[prop] === type;
}

export function mayHaveAndIsOfType(obj: { [key: string]: any }, prop: string, type: 'number' | 'boolean' | 'string') {
    return obj[prop] === undefined || typeof obj[prop] === type;
}