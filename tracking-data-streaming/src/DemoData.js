// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export const DEMO_POSITION_UPDATE_INTERVAL = 5000; // REQUIRED - How often the position updates in the demo.
export const POSITION_UPDATES_TRUCK_1 = [
    {
        Data: {
            DeviceId: "Truck-1",
            Position: [-122.329640, 47.550247],
        },
        PartitionKey: "1"
    },
    {
        Data: {
            DeviceId: "Truck-1",
            Position: [-122.329608, 47.548651],
        },
        PartitionKey: "2"
    },
    {
        Data: {
            DeviceId: "Truck-1",
            Position: [-122.329592, 47.546398],
        },
        PartitionKey: "2"
    },
    {
        Data: {
            DeviceId: "Truck-1",
            Position: [-122.329654, 47.545014],
        },
        PartitionKey: "2"
    },
    {
        Data: {
            DeviceId: "Truck-1",
            Position: [-122.329586, 47.544046],
        },
        PartitionKey: "3"
    },
    {
        Data: {
            DeviceId: "Truck-1",
            Position: [-122.328683, 47.543379],
        },
        PartitionKey: "2"
    },
    {
        Data: {
            DeviceId: "Truck-1",
            Position: [-122.328889, 47.543028],
        },
        PartitionKey: "2"
    },
    {
        Data: {
            DeviceId: "Truck-1",
            Position: [-122.328417, 47.543341],
        },
        PartitionKey: "2"
    }
];

export const POSITION_UPDATES_TRUCK_2 = [
    {
        Data: {
            DeviceId: "Truck-2",
            Position: [-122.322219, 47.545143],
        },
        PartitionKey: "3"
    },
    {
        Data: {
            DeviceId: "Truck-2",
            Position: [-122.322891, 47.543234],
        },
        PartitionKey: "3"
    },
    {
        Data: {
            DeviceId: "Truck-2",
            Position: [-122.323321, 47.541726],
        },
        PartitionKey: "2"
    },
    {
        Data: {
            DeviceId: "Truck-2",
            Position: [-122.323784, 47.540603],
        },
        PartitionKey: "1"
    },
    {
        Data: {
            DeviceId: "Truck-2",
            Position: [-122.324112, 47.540823],
        },
        PartitionKey: "2"
    },
    {
        Data: {
            DeviceId: "Truck-2",
            Position: [-122.326810, 47.542322],
        },
        PartitionKey: "3"
    },
    {
        Data: {
            DeviceId: "Truck-2",
            Position: [-122.327667, 47.542306],
        },
        PartitionKey: "3"
    },
    {
        Data: {
            DeviceId: "Truck-2",
            Position: [-122.326375, 47.542144],
        },
        PartitionKey: "3"
    }
];

export const DEMO_GEOFENCES = [
    {
        "GeofenceId": "Warehouse",
        "Polygon": [
            [-122.329736, 47.543216],
            [-122.328513, 47.542365],
            [-122.327278, 47.541601],
            [-122.326672, 47.541613],
            [-122.326415, 47.541739],
            [-122.329429, 47.543460],
            [-122.329736, 47.543216]
        ]
    },
    {
        "GeofenceId": "WarehouseVicinity-North",
        "Polygon": [
            [-122.331564, 47.544981],
            [-122.329476, 47.543950],
            [-122.329509, 47.545398],
            [-122.331564, 47.544981]
        ]
    },
    {
        "GeofenceId": "WarehouseVicinity-South",
        "Polygon": [
            [-122.324886, 47.541209],
            [-122.323688, 47.540418],
            [-122.323353, 47.541535],
            [-122.324886, 47.541209]
        ]
    }
]
