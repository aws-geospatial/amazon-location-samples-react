// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Source, Layer } from "react-map-gl";

// boundary of the city of Vancouver
import vancouver from "./vancouver.json";

export default () => (
  // Make the Vancouver boundary available as a data source
  // See https://visgl.github.io/react-map-gl/docs/api-reference/source
  <Source type="geojson" data={vancouver}>
    {/* Create a map layer that displays the boundary and styles it
          See https://visgl.github.io/react-map-gl/docs/api-reference/layer */}
    <Layer
      type="fill"
      paint={{ "fill-color": "steelblue", "fill-opacity": 0.3 }}
    />
  </Source>
);
