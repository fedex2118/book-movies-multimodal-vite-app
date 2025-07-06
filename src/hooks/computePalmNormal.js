function computePalmNormal(lm) {
    // we want to find the perpendicular direction with respect to the hand palm
    // this gives us the orientation of the hand
    const p0 = lm[0], p1 = lm[5], p2 = lm[17]; // wrist, base of index finger, base of pinky finger... form a triangle on the palm plane
    // now we create two vectors in the palm plane
    // v1 = from wrist to base of index
    // v2 = from base of index to base of pinky
    const v1 = { x: p1.x - p0.x, y: p1.y - p0.y, z: p1.z - p0.z };
    const v2 = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
    // cross product v1 × v2
    // this is usefull to have a vector perpendicular to the palm plane
    const nx = v1.y * v2.z - v1.z * v2.y;
    const ny = v1.z * v2.x - v1.x * v2.z;
    const nz = v1.x * v2.y - v1.y * v2.x;
    // we now can compute the length of the 3d vector with the L2 norm, fallback is 1 to avoid NaN or infinity when dividing by 0 
    const norm = Math.hypot(nx, ny, nz) || 1;
    // this normalization factor is used to normalized the perpendicular vector so that it's length is always 1
    // result = we got a unit vector that points at the same direction as the original vector
    return [ nx / norm, ny / norm, nz / norm ];
}

export default computePalmNormal;