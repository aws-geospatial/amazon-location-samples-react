// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { MapView } from "@aws-amplify/ui-react";
import { NavigationControl } from "react-map-gl";

// Include MapLibre CSS for common elements like the NavigationControl
import "maplibre-gl/dist/maplibre-gl.css";

// Amplify configuration
import "./config";

export default () => (
  <MapView
    // See https://ui.docs.amplify.aws/react/connected-components/geo#mapview
    initialViewState={{
      latitude: 31.0,
      longitude: 0.0,
      zoom: 2,
    }}
  >
    {/* See https://visgl.github.io/react-map-gl/docs/api-reference/navigation-control */}
    <NavigationControl position="bottom-right" showZoom showCompass={false} />
  </MapView>
);
