"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interfaceValidation = exports.typeInterface = void 0;
__exportStar(require("./types"), exports);
var types_ti_1 = require("./types-ti");
exports.typeInterface = types_ti_1.default;
function interfaceValidation(validation, nestlevel) {
    var _a;
    if (nestlevel === void 0) { nestlevel = 0; }
    var message = "";
    for (var _i = 0, validation_1 = validation; _i < validation_1.length; _i++) {
        var err = validation_1[_i];
        message += "<span style=\"margin-left:".concat(nestlevel, "rem\"><span style=\"font-family: monospace; font-size: 1rem;\">").concat(err.path.replace("value.", ""), "</span> ").concat(err.message).concat(err.nested ? ":" : ".", "</span>\n");
        if (err.nested) {
            message += (_a = interfaceValidation(err.nested, nestlevel + 1)) !== null && _a !== void 0 ? _a : "";
        }
    }
    return message.replaceAll("is not a", "is not of type");
}
exports.interfaceValidation = interfaceValidation;
