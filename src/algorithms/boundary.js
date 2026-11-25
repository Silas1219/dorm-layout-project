
import { getFurnitureFootprint } from "./collision.js";

const EPSILON = 1e-9;


// 1. Calculate the boundaries of the room
export function getRoomBounds(room) {
    if (!room || typeof room !== "object") {
        throw new TypeError("Room must be an object.");
    }

    for (const field of ["width", "depth"]) {
        if (
            typeof room[field] !== "number" ||
            !Number.isFinite(room[field])
        ) {
            throw new TypeError(
                `Room ${field} must be a finite number.`
            );
        }

        if (room[field] <= 0) {
            throw new RangeError(
                `Room ${field} must be positive.`
            );
        }
    }

    return {
        minX: -room.width / 2,
        maxX: room.width / 2,

        minZ: -room.depth / 2,
        maxZ: room.depth / 2
    };
}


// 2. Check which room boundaries a footprint exceeds
function getOutOfBoundsSides(footprint, roomBounds) {
    const sides = [];

    // Left boundary
    if (footprint.minX < roomBounds.minX - EPSILON) {
        sides.push("left");
    }

    // Right boundary
    if (footprint.maxX > roomBounds.maxX + EPSILON) {
        sides.push("right");
    }

    // Back boundary
    if (footprint.minZ < roomBounds.minZ - EPSILON) {
        sides.push("back");
    }

    // Front boundary
    if (footprint.maxZ > roomBounds.maxZ + EPSILON) {
        sides.push("front");
    }

    return sides;
}


// 3. Find all furniture items outside the room
export function findBoundaryViolations(room, furniture) {
    if (!Array.isArray(furniture)) {
        throw new TypeError("Furniture must be an array.");
    }

    const roomBounds = getRoomBounds(room);

    const violations = [];

    for (const item of furniture) {

        const footprint = getFurnitureFootprint(item);

        const sides = getOutOfBoundsSides(
            footprint,
            roomBounds
        );

        if (sides.length > 0) {
            violations.push({
                type: "out-of-bounds",
                furnitureIds: [item.id],
                sides
            });
        }
    }

    return violations;
}
