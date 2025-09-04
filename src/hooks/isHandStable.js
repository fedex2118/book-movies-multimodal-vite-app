import React from 'react';

const MAX_DEV_EPS = 0.04; // instability threshold

const history = [];      // sliding window for palm normals
const WINDOW_SIZE = 5;

function isHandStable(palmNormal) {
// Assicuriamoci che palmNormal sia un array di 3 numeri

if (
    !Array.isArray(palmNormal) ||
    palmNormal.length < 3 ||
    palmNormal.some(v => typeof v !== 'number')
) {
    return false;
}

// 1) Inserisci nella finestra
history.push(palmNormal);
if (history.length > WINDOW_SIZE) {
    history.shift();
}

// 2) Solo quando abbiamo abbastanza elementi
if (history.length < WINDOW_SIZE) {
    return false;
}

// 3) Calcola medie x,y,z
let sumX = 0, sumY = 0, sumZ = 0;
for (const v of history) {
    // doppio check di sicurezza
    if (Array.isArray(v) && v.length >= 3) {
    sumX += v[0];
    sumY += v[1];
    sumZ += v[2];
    }
}
const avgX = sumX / WINDOW_SIZE;
const avgY = sumY / WINDOW_SIZE;
const avgZ = sumZ / WINDOW_SIZE;

// 4) Calcola deviazione massima
let maxDev = 0;
for (const v of history) {
    if (Array.isArray(v) && v.length >= 3) {
    maxDev = Math.max(
        maxDev,
        Math.abs(v[0] - avgX),
        Math.abs(v[1] - avgY),
        Math.abs(v[2] - avgZ)
    );
    }
}

// 5) Se è sotto la soglia, è stabile
return maxDev < MAX_DEV_EPS;
}

export default isHandStable;
  