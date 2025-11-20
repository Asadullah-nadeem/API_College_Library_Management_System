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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFine = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const FINE_RATE = parseFloat(process.env.FINE_RATE_PER_DAY || '50');
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const calculateFine = (dueDate, returnDate) => {
    const dueDateTime = dueDate.getTime();
    const returnDateTime = returnDate.getTime();
    if (returnDateTime <= dueDateTime) {
        return 0;
    }
    const timeDiff = returnDateTime - dueDateTime;
    const dayDiff = Math.ceil(timeDiff / MS_PER_DAY);
    if (dayDiff < 0) {
        return 0;
    }
    const fineAmount = dayDiff * FINE_RATE;
    return Math.round(fineAmount * 100) / 100;
};
exports.calculateFine = calculateFine;
