"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//General ApiState that should be returned w/ every response
var helper_1 = require("../helper");
function isApiState(obj) {
    return obj && typeof obj === 'object' &&
        helper_1.hasAndIsOfType(obj, 'needsReauth', 'boolean') &&
        helper_1.hasAndIsOfType(obj, 'error', "boolean") &&
        helper_1.mayHaveAndIsOfType(obj, 'userFacingErrorMessage', 'string') &&
        helper_1.mayHaveAndIsOfType(obj, 'errorId', 'string');
}
exports.isApiState = isApiState;
function isGenericResponse(obj) {
    return obj && typeof obj === 'object' && obj.state && isApiState(obj.state);
}
exports.isGenericResponse = isGenericResponse;
