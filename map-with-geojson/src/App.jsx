// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { MapView } from "@aws-amplify/ui-react";
import { NavigationControl } from "react-map-gl";

import "maplibre-gl/dist/maplibre-gl.css";

// Amplify configuration
import "./config"
import VancouverOverlay from "./VancouverOverlay";

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

    {/* Display the city of Vancouver as a polygon overlay */}
    <VancouverOverlay />
  </MapView>
);
