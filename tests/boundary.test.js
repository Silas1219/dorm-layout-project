
import test from "node:test";
import assert from "node:assert/strict";

import {
    getRoomBounds,
    findBoundaryViolations
} from "../src/algorithms/boundary.js";


const room = {
    width: 4,
    depth: 5
};


function createFurniture(overrides = {}) {
    return {
        id: "bed1",
        type: "bed",
        x: 0,
        z: 0,
        width: 1,
        depth: 2,
        height: 0.5,
        rotation: 0,
        ...overrides
    };
}


// Test 1: Correct room boundaries
test("Calculate correct room boundaries", () => {
    assert.deepEqual(
        getRoomBounds(room),
        {
            minX: -2,
            maxX: 2,
            minZ: -2.5,
            maxZ: 2.5
        }
    );
});


// Test 2: Furniture completely inside the room
test("Furniture inside the room is valid", () => {
    const furniture = [createFurniture()];

    assert.deepEqual(
        findBoundaryViolations(room, furniture),
        []
    );
});


// Test 3: Left boundary violation
test("Detect left boundary violation", () => {
    const furniture = [
        createFurniture({ x: -1.8 })
    ];

    const results = findBoundaryViolations(room, furniture);

    assert.equal(results.length, 1);

    assert.deepEqual(results[0].sides, ["left"]);
});


// Test 4: Right boundary violation
test("Detect right boundary violation", () => {
    const furniture = [
        createFurniture({ x: 1.8 })
    ];

    const results = findBoundaryViolations(room, furniture);

    assert.deepEqual(results[0].sides, ["right"]);
});


// Test 5: Front and back boundary violations
test("Detect front and back boundary violations", () => {
    const furniture = [
        createFurniture({
            id: "bed1",
            z: -2
        }),

        createFurniture({
            id: "desk1",
            z: 2
        })
    ];

    assert.deepEqual(
        findBoundaryViolations(room, furniture),
        [
            {
                type: "out-of-bounds",
                furnitureIds: ["bed1"],
                sides: ["back"]
            },
            {
                type: "out-of-bounds",
                furnitureIds: ["desk1"],
                sides: ["front"]
            }
        ]
    );
});


// Test 6: Furniture touching the room boundaries
test("Furniture touching walls is valid", () => {
    const furniture = [
        createFurniture({
            x: 1.5,
            z: 1.5
        })
    ];

    assert.deepEqual(
        findBoundaryViolations(room, furniture),
        []
    );
});


// Test 7: Furniture exceeding multiple boundaries
test("Detect multiple boundary violations", () => {
    const furniture = [
        createFurniture({
            x: 1.8,
            z: 2
        })
    ];

    assert.deepEqual(
        findBoundaryViolations(room, furniture),
        [
            {
                type: "out-of-bounds",
                furnitureIds: ["bed1"],
                sides: ["right", "front"]
            }
        ]
    );
});


// Test 8: Rotation causes a boundary violation
test("Rotation can cause boundary violation", () => {
    const item = createFurniture({
        x: 1.25,
        width: 1,
        depth: 2
    });

    // Before rotation: valid
    assert.deepEqual(
        findBoundaryViolations(room, [item]),
        []
    );

    // After rotation: out of bounds
    const rotatedItem = {
        ...item,
        rotation: 90
    };

    assert.deepEqual(
        findBoundaryViolations(room, [rotatedItem]),
        [
            {
                type: "out-of-bounds",
                furnitureIds: ["bed1"],
                sides: ["right"]
            }
        ]
    );
});


// Test 9: Furniture larger than the room
test("Oversized furniture exceeds all boundaries", () => {
    const furniture = [
        createFurniture({
            width: 6,
            depth: 7
        })
    ];

    const results = findBoundaryViolations(room, furniture);

    assert.deepEqual(
        results[0].sides,
        ["left", "right", "back", "front"]
    );
});


// Test 10: Invalid room dimensions
test("Reject invalid room dimensions", () => {
    const invalidRoom = {
        width: -4,
        depth: 5
    };

    assert.throws(
        () => findBoundaryViolations(invalidRoom, []),
        RangeError
    );
});
