function normalizeLandmarks(lm) {
    const [wx, wy, wz] = [lm[0].x, lm[0].y, lm[0].z]; // we take the wrist position as the origin of our hand
    const centered = lm.map(pt => ({
        x: pt.x - wx,
        y: pt.y - wy,
        z: pt.z - wz
    })); // we center each hand point around the wrist position
    // this means that the origin (wrist) is now (0, 0, 0), all points are translated
    let maxDist = 0;
    centered.forEach(pt => {
        maxDist = Math.max(maxDist, Math.hypot(pt.x, pt.y, pt.z)); // we get the maximum distance from the origin 
        // max hypot is the L2 norm computed for of each point
    });
    // we now scale each point by the maximum distance, so the largest distance becomes 1
    // we flatten the array into a single number array. [x1, y1, z1, x2, y2, z2, ...]
    return centered.flatMap(pt => [pt.x / maxDist, pt.y / maxDist, pt.z / maxDist]);
}

export default normalizeLandmarks;