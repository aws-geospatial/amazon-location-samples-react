// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import Map, {NavigationControl} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
// Amazon Hub Lockers in Vancouver as a GeoJSON FeatureCollection
import lockerGeoJSON from "./lockers.json";
// React Component that renders markers for all provided lockers
import LockerMarkers from "./LockerMarkers";

const apiKey = import.meta.env.VITE_API_KEY;
const region = import.meta.env.VITE_REGION;

// transform GeoJSON features into simplified locker objects
const lockers = lockerGeoJSON.features.map(
      ({
            geometry: {
                  coordinates: [longitude, latitude],
            },
            properties: {title, address: description},
      }) => ({
            latitude,
            longitude,
            title,
            description,
      })
);

export default () => (
      <Map
            // See https://visgl.github.io/react-map-gl/docs/api-reference/map
            initialViewState={{
                  latitude: 49.2509,
                  longitude: -123.1147,
                  zoom: 11,
            }}
            style={{height: "100vh", width: "100vw"}}
            mapStyle={`https://maps.geo.${region}.amazonaws.com/v2/styles/Standard/descriptor?key=${apiKey}&color-scheme=Light`}
      >
            {/* See https://visgl.github.io/react-map-gl/docs/api-reference/navigation-control */}
            <NavigationControl
                  position="bottom-right"
                  showZoom
                  showCompass={false}
            />

            {/* Render markers for all lockers, with a popup for the selected locker */}
            <LockerMarkers lockers={lockers} />
      </Map>
);
