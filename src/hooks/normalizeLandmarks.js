function normalizeLandmarks(lm) {
    const [wx, wy, wz] = [lm[0].x, lm[0].y, lm[0].z];
    const centered = lm.map(pt => ({
        x: pt.x - wx,
        y: pt.y - wy,
        z: pt.z - wz
    }));
    let maxDist = 0;
    centered.forEach(pt => {
        maxDist = Math.max(maxDist, Math.hypot(pt.x, pt.y, pt.z));
    });
    return centered.flatMap(pt => [pt.x / maxDist, pt.y / maxDist, pt.z / maxDist]);
}

export default normalizeLandmarks;