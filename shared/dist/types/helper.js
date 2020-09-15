"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function hasAndIsOfType(obj, prop, type) {
    return (obj[prop] !== undefined) && typeof obj[prop] === type;
}
exports.hasAndIsOfType = hasAndIsOfType;
function mayHaveAndIsOfType(obj, prop, type) {
    return obj[prop] === undefined || typeof obj[prop] === type;
}
exports.mayHaveAndIsOfType = mayHaveAndIsOfType;
