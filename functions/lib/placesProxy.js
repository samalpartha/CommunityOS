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
exports.proxyGeocode = exports.proxyGooglePlaces = void 0;
const functions = __importStar(require("firebase-functions"));
// Google Places API configuration
const PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place';
const GEOCODE_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
/**
 * Proxy for Google Places Nearby Search to avoid CORS
 */
exports.proxyGooglePlaces = functions.https.onCall(async (data, context) => {
    // Optional: Check auth
    // if (!context.auth) {
    //     throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    // }
    var _a;
    const { location, radius, type } = data;
    const apiKey = (_a = functions.config().google) === null || _a === void 0 ? void 0 : _a.places_api_key;
    if (!apiKey) {
        throw new functions.https.HttpsError('failed-precondition', 'API Key not configured.');
    }
    try {
        let url = `${PLACES_API_URL}/nearbysearch/json?` +
            `location=${location.lat},${location.lng}` +
            `&radius=${radius || 5000}` +
            `&key=${apiKey}`;
        if (type) {
            url += `&type=${type}`;
        }
        // Note: 'keyword' parameter in Google Places API is 'keyword', not 'name'
        // If we want to filter by name/pantry etc on the server side google query
        // But the previous implementation filtered in memory.
        // We will just do a simple nearby search here.
        const response = await fetch(url);
        if (!response.ok) {
            throw new functions.https.HttpsError('internal', `Upstream API error: ${response.statusText}`);
        }
        const result = await response.json();
        return result; // Returns the raw Google Places response
    }
    catch (error) {
        console.error('Proxy Error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch places.');
    }
});
/**
 * Proxy for Google Geocoding to avoid CORS
 */
exports.proxyGeocode = functions.https.onCall(async (data, context) => {
    var _a;
    const { address } = data;
    const apiKey = (_a = functions.config().google) === null || _a === void 0 ? void 0 : _a.places_api_key;
    if (!apiKey) {
        throw new functions.https.HttpsError('failed-precondition', 'API Key not configured.');
    }
    try {
        const url = `${GEOCODE_API_URL}?address=${encodeURIComponent(address)}&key=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new functions.https.HttpsError('internal', `Upstream API error: ${response.statusText}`);
        }
        const result = await response.json();
        return result;
    }
    catch (error) {
        console.error('Proxy Error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to geocode.');
    }
});
//# sourceMappingURL=placesProxy.js.map