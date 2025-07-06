function computePalmNormal(lm) {
    const p0 = lm[0], p1 = lm[5], p2 = lm[17];
    const v1 = { x: p1.x - p0.x, y: p1.y - p0.y, z: p1.z - p0.z };
    const v2 = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
    // cross product v1 × v2
    const nx = v1.y * v2.z - v1.z * v2.y;
    const ny = v1.z * v2.x - v1.x * v2.z;
    const nz = v1.x * v2.y - v1.y * v2.x;
    const norm = Math.hypot(nx, ny, nz) || 1;
    return [ nx / norm, ny / norm, nz / norm ];
}

export default computePalmNormal;