// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import Map, { NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import VancouverOverlay from "./VancouverOverlay";

const apiKey = import.meta.env.VITE_API_KEY;
const region = import.meta.env.VITE_REGION;

export default () => (
  <Map
    // See https://visgl.github.io/react-map-gl/docs/api-reference/map
    initialViewState={{
      latitude: 49.2509,
      longitude: -123.1147,
      zoom: 11,
    }}
    style={{ height: "100vh", width: "100vw" }}
    mapStyle={`https://maps.geo.${region}.amazonaws.com/v2/styles/Standard/descriptor?key=${apiKey}&color-scheme=Light`}
    validateStyle={false} // Disable style validation for faster map load
  >
    {/* See https://visgl.github.io/react-map-gl/docs/api-reference/navigation-control */}
    <NavigationControl position="bottom-right" showZoom showCompass={false} />

    {/* Display the city of Vancouver as a polygon overlay */}
    <VancouverOverlay />
  </Map>
);
