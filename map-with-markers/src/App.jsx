// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { MapView } from "@aws-amplify/ui-react";
import { NavigationControl } from "react-map-gl";

import "maplibre-gl/dist/maplibre-gl.css";

// Amplify configuration
import "./config";

// Amazon Hub Lockers in Vancouver as a GeoJSON FeatureCollection
import lockerGeoJSON from "./lockers.json";

// React Component that renders markers for all provided lockers
import LockerMarkers from "./LockerMarkers";

// transform GeoJSON features into simplified locker objects
const lockers = lockerGeoJSON.features.map(
  ({
    geometry: {
      coordinates: [longitude, latitude],
    },
    properties: { title, address: description },
  }) => ({
    latitude,
    longitude,
    title,
    description,
  })
);

export default () => (
  <MapView
    // See https://ui.docs.amplify.aws/react/connected-components/geo#mapview
    initialViewState={{
      latitude: 49.2819,
      longitude: -123.1187,
      zoom: 11,
    }}
  >
    {/* See https://visgl.github.io/react-map-gl/docs/api-reference/navigation-control */}
    <NavigationControl position="bottom-right" showZoom showCompass={false} />

    {/* Render markers for all lockers, with a popup for the selected locker */}
    <LockerMarkers lockers={lockers} />
  </MapView>
);
