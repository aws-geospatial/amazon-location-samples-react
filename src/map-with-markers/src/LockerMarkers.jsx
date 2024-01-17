// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useState } from "react";
import { Marker } from "react-map-gl/maplibre";

// Customized popup that displays locker titles and descriptions
import LockerPopup from "./LockerPopup";

// A pushpin icon that changes color when selected
import PinIcon from "./PinIcon";

// Displays a single marker with interaction and a custom icon
const LockerMarker = ({ locker, selectedLocker, onLockerSelected }) => (
  // Render a react-map-gl Marker with a click handler that passes data back to its parent
  // See https://visgl.github.io/react-map-gl/docs/api-reference/marker
  <Marker
    latitude={locker.latitude}
    longitude={locker.longitude}
    onClick={(e) => {
      e.originalEvent.stopPropagation();
      onLockerSelected(locker);
    }}
  >
    <PinIcon size={35} isSelected={locker === selectedLocker} />
  </Marker>
);

// Render markers for all lockers, with a popup for the selected locker
export default ({ lockers }) => {
  const [selectedLocker, setSelectedLocker] = useState();

  return (
    <>
      {
        // Render markers for all lockers
        lockers.map((locker, index) => (
          <LockerMarker
            key={index}
            locker={locker}
            selectedLocker={selectedLocker}
            onLockerSelected={setSelectedLocker}
          />
        ))
      }
      {/* Display a popup when a locker is selected */}
      {selectedLocker && (
        <LockerPopup locker={selectedLocker} onClose={() => setSelectedLocker(null)} />
      )}
    </>
  );
};
