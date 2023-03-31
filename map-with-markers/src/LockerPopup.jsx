// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Popup } from "react-map-gl";

// A popup containing locker details
export default ({
  locker: { latitude, longitude, title, description },
  onClose,
}) => (
  // See https://visgl.github.io/react-map-gl/docs/api-reference/popup
  <Popup
    latitude={latitude}
    longitude={longitude}
    // offset the popup so that it attaches to the top of the pushpin
    offset={[0, -36]}
    closeButton
    closeOnClick
    onClose={onClose}
    anchor="bottom"
  >
    <>
      <h3>{title}</h3>
      <p>{description}</p>
    </>
  </Popup>
);
