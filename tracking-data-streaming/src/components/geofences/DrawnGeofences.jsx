// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useMemo } from "react";
import { Source, Layer } from "react-map-gl/maplibre";

// Format geofence data into GeoJSON
const getGeometryJson = (geofences) => {
  const features = geofences.map((geofence) => ({
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: geofence.Geometry?.Polygon,
    },
  }));

  return {
    type: "FeatureCollection",
    features,
  };
};

// Properties for the polygons
const polygons = {
  id: "polygons",
  type: "fill",
  source: "drawn-geofences",
  paint: {
    "fill-color": "#FF1B57",
    "fill-opacity": 0.4,
  },
};

const polygonsBreached = {
  id: "polygonsBreached",
  type: "fill",
  source: "drawn-geofences-breached",
  paint: {
    "fill-color": "#2DC9C9",
    "fill-opacity": 0.4,
  },
};

// Drawn geofences on the map
const DrawnGeofences = ({
  geofences,
  breachingGeofences,
  geofencesVisible,
}) => {
  const geofenceJson = useMemo(
    () =>
      getGeometryJson(
        geofences.filter(
          (item) => !breachingGeofences.includes(item.GeofenceId)
        )
      ),
    [geofences, breachingGeofences]
  );
  const breachingGeofenceJson = useMemo(
    () =>
      getGeometryJson(
        geofences.filter((item) => breachingGeofences.includes(item.GeofenceId))
      ),
    [geofences, breachingGeofences]
  );
  if (geofencesVisible) {
    return (
      <>
        <Source id="drawn-geofences" type="geojson" data={geofenceJson}>
          <Layer {...polygons} />
        </Source>
        <Source
          id="drawn-geofences-breached"
          type="geojson"
          data={breachingGeofenceJson}
        >
          <Layer {...polygonsBreached} />
        </Source>
      </>
    );
  } else {
    return;
  }
};

export default DrawnGeofences;
