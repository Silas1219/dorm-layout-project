
import test from "node:test";
import assert from "node:assert/strict";

import {
    findCorridorViolations
} from "../src/algorithms/corridor.js";


const entrance = {
    id: "entrance",
    x: 0,
    z: -2,
    width: 0.9,
    depth: 1
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


// Test 1: Empty corridor list
test("Empty corridor list should return no violations", () => {
    assert.deepEqual(
        findCorridorViolations([], [createFurniture()]),
        []
    );
});


// Test 2: Furniture outside the corridor
test("Furniture outside corridor should be valid", () => {
    const furniture = [
        createFurniture()
    ];

    assert.deepEqual(
        findCorridorViolations([entrance], furniture),
        []
    );
});


// Test 3: Furniture fully occupying corridor
test("Furniture inside corridor should be detected", () => {
    const furniture = [
        createFurniture({
            id: "desk1",
            x: 0,
            z: -2,
            width: 0.8,
            depth: 0.8
        })
    ];

    const results = findCorridorViolations(
        [entrance],
        furniture
    );

assert.equal(results.length, 1);

const result = results[0];

// Check conflict type
assert.equal(
    result.type,
    "corridor-occupied"
);

// Check furniture ID
assert.deepEqual(
    result.furnitureIds,
    ["desk1"]
);

// Check corridor ID
assert.deepEqual(
    result.corridorIds,
    ["entrance"]
);

// Check overlap width with floating-point tolerance
assert.ok(
    Math.abs(result.overlapWidth - 0.8) < 1e-9
);

// Check overlap depth with floating-point tolerance
assert.ok(
    Math.abs(result.overlapDepth - 0.8) < 1e-9
);

});


// Test 4: Partial corridor occupation
test("Partial corridor overlap should be detected", () => {
    const furniture = [
        createFurniture({
            id: "desk1",
            x: 0.6,
            z: -2,
            width: 0.6,
            depth: 0.6
        })
    ];

    const results = findCorridorViolations(
        [entrance],
        furniture
    );

    assert.equal(results.length, 1);

    assert.ok(
        Math.abs(results[0].overlapWidth - 0.15) < 1e-9
    );

    assert.ok(
        Math.abs(results[0].overlapDepth - 0.6) < 1e-9
    );
});


// Test 5: Edge touching should not count as occupation
test("Furniture touching corridor edge is valid", () => {
    const furniture = [
        createFurniture({
            x: 0.75,
            z: -2,
            width: 0.6,
            depth: 0.6
        })
    ];

    assert.deepEqual(
        findCorridorViolations([entrance], furniture),
        []
    );
});


// Test 6: Rotation changes corridor occupation
test("Rotated furniture can occupy a corridor", () => {
    const desk = createFurniture({
        id: "desk1",
        x: 0.9,
        z: -2,
        width: 0.6,
        depth: 1.2,
        rotation: 0
    });

    // Before rotation: no occupation
    assert.deepEqual(
        findCorridorViolations([entrance], [desk]),
        []
    );

    // After rotation: occupation detected
    const rotatedDesk = {
        ...desk,
        rotation: 90
    };

    assert.equal(
        findCorridorViolations(
            [entrance],
            [rotatedDesk]
        ).length,
        1
    );
});


// Test 7: Multiple furniture items occupy one corridor
test("Detect multiple furniture items in one corridor", () => {
    const furniture = [
        createFurniture({
            id: "chair1",
            x: -0.2,
            z: -2,
            width: 0.4,
            depth: 0.5
        }),

        createFurniture({
            id: "chair2",
            x: 0.2,
            z: -2,
            width: 0.4,
            depth: 0.5
        })
    ];

    const results = findCorridorViolations(
        [entrance],
        furniture
    );

    assert.equal(results.length, 2);

    assert.deepEqual(
        results.map(item => item.furnitureIds[0]),
        ["chair1", "chair2"]
    );
});


// Test 8: One furniture item occupies multiple corridors
test("Detect one furniture item occupying multiple corridors", () => {
    const corridors = [
        entrance,

        {
            id: "corridor2",
            x: 0.5,
            z: -2,
            width: 0.9,
            depth: 1
        }
    ];

    const furniture = [
        createFurniture({
            id: "desk1",
            x: 0.25,
            z: -2,
            width: 0.6,
            depth: 0.6
        })
    ];

    const results = findCorridorViolations(
        corridors,
        furniture
    );

    assert.equal(results.length, 2);

    assert.deepEqual(
        results.map(item => item.corridorIds[0]),
        ["entrance", "corridor2"]
    );
});


// Test 9: Invalid corridor dimensions
test("Reject invalid corridor dimensions", () => {
    const invalidCorridor = {
        id: "entrance",
        x: 0,
        z: -2,
        width: 0,
        depth: 1
    };

    assert.throws(
        () => findCorridorViolations(
            [invalidCorridor],
            []
        ),
        RangeError
    );
});


// Test 10: Duplicate corridor IDs
test("Reject duplicate corridor IDs", () => {
    const corridors = [
        entrance,
        {
            ...entrance,
            x: 1
        }
    ];

    assert.throws(
        () => findCorridorViolations(
            corridors,
            []
        ),
        /Duplicate corridor id/
    );
});
