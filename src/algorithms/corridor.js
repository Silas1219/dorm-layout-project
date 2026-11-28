import { getFurnitureFootprint } from "./collision.js";
const EPSILON = 1e-9;

// 1. Calculate the rectangular footprint of a corridor
export function getCorridorFootprint(corridor) {
    if (!corridor || typeof corridor !== "object") {
        throw new TypeError("Corridor must be an object.");
    }

    if (
        typeof corridor.id !== "string" ||
        corridor.id.trim() === ""
    ) {
        throw new TypeError("Corridor must have a valid id.");
    }

    for (const field of ["x", "z", "width", "depth"]) {
        if (
            typeof corridor[field] !== "number" ||
            !Number.isFinite(corridor[field])
        ) {
            throw new TypeError(
                `${field} must be a finite number.`
            );
        }
    }

    if (corridor.width <= 0 || corridor.depth <= 0) {
        throw new RangeError(
            "Corridor dimensions must be positive."
        );
    }

    return {
        id: corridor.id,

        minX: corridor.x - corridor.width / 2,
        maxX: corridor.x + corridor.width / 2,

        minZ: corridor.z - corridor.depth / 2,
        maxZ: corridor.z + corridor.depth / 2
    };
}

// 2. Check whether a furniture footprint overlaps a corridor
function checkCorridorOverlap(furniture, corridor) {

    const overlapWidth =
        Math.min(furniture.maxX, corridor.maxX) -
        Math.max(furniture.minX, corridor.minX);

    const overlapDepth =
        Math.min(furniture.maxZ, corridor.maxZ) -
        Math.max(furniture.minZ, corridor.minZ);

    if (
        overlapWidth > EPSILON &&
        overlapDepth > EPSILON
    ) {
        return {
            overlapWidth,
            overlapDepth
        };
    }

    return null;
}


// 3. Find all occupied corridors
export function findCorridorViolations(corridors, furniture) {

    if (!Array.isArray(corridors)) {
        throw new TypeError("Corridors must be an array.");
    }

    if (!Array.isArray(furniture)) {
        throw new TypeError("Furniture must be an array.");
    }

    // Calculate all corridor footprints
    const corridorFootprints = corridors.map(
        getCorridorFootprint
    );

    // Calculate all furniture footprints
    const furnitureFootprints = furniture.map(
        getFurnitureFootprint
    );

    // Check duplicate corridor IDs
    const corridorIds = new Set();

    for (const corridor of corridorFootprints) {
        if (corridorIds.has(corridor.id)) {
            throw new Error(
                `Duplicate corridor id: ${corridor.id}`
            );
        }

        corridorIds.add(corridor.id);
    }

    // Check duplicate furniture IDs
    const furnitureIds = new Set();

    for (const item of furnitureFootprints) {
        if (furnitureIds.has(item.id)) {
            throw new Error(
                `Duplicate furniture id: ${item.id}`
            );
        }

        furnitureIds.add(item.id);
    }

    const violations = [];

    // Compare every corridor with every furniture item
    for (const corridor of corridorFootprints) {

        for (const item of furnitureFootprints) {

            const overlap = checkCorridorOverlap(
                item,
                corridor
            );

            if (overlap) {
                violations.push({
                    type: "corridor-occupied",

                    furnitureIds: [item.id],

                    corridorIds: [corridor.id],

                    overlapWidth: overlap.overlapWidth,

                    overlapDepth: overlap.overlapDepth
                });
            }
        }
    }

    return violations;
}
