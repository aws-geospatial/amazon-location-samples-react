// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState, useEffect } from "react";
import { LocationClient } from "@aws-sdk/client-location";
import { SQS } from "@aws-sdk/client-sqs";
import { Kinesis } from "@aws-sdk/client-kinesis";
import {
  REGION,
  MAP,
  WRITE_ONLY_IDENTITY_POOL_ID,
  READ_ONLY_IDENTITY_POOL_ID
} from "./configuration";
import {
  GEOFENCES_PANEL,
  TRACKERS_PANEL,
  MAP_CONTAINER,
  GEOFENCE_DRAWING_MODE,
  DEVICE_POSITION_HISTORY_VIEWER,
} from "./constants";
import GeofencesLayer from "./components/geofences/GeofencesLayer";
import TrackersLayer from "./components/trackers/TrackersLayer";
import Map, { NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import "@cloudscape-design/global-styles/index.css"
import { withIdentityPoolId } from "@aws/amazon-location-utilities-auth-helper";
import "./index.css";

// As a best practice, splitting out the Read permissions to a readOnly role so that customers' permissions are strictly separate from system admin's.
let authHelpers = {
  readOnly: undefined,
  writeOnly: undefined,
};

const getAuthHelpers = async () => {
  if (!authHelpers.readOnlyAuthHelper) {
    authHelpers.readOnlyAuthHelper = await withIdentityPoolId(
      READ_ONLY_IDENTITY_POOL_ID
    );
  }
  if (!authHelpers.writeOnlyAuthHelper) {
    authHelpers.writeOnlyAuthHelper = await withIdentityPoolId(
      WRITE_ONLY_IDENTITY_POOL_ID
    );
  }
  return authHelpers;
};

const App = () => {
  const [readOnlyAuthHelper, setReadOnlyAuthHelper] = useState();
  const [readOnlyRoleCredentials, setReadOnlyRoleCredentials] = useState();
  const [writeOnlyRoleCredentials, setWriteOnlyRoleCredentials] = useState();
  const [readOnlyLocationClient, setReadOnlyLocationClient] = useState();
  const [writeOnlyLocationClient, setWriteOnlyLocationClient] = useState();
  const [readOnlySqsClient, setReadOnlySqsClient] = useState();
  const [writeOnlySqsClient, setWriteOnlySqsClient] = useState();
  const [kinesisClient, setKinesisClient] = useState();
  const [openedPanel, setOpenedPanel] = useState();
  const [openedInfoBox, setOpenedInfoBox] = useState();
  const [breachingGeofences, setBreachingGeofences] = useState([]);

  //Fetch writeOnlyRoleCredentials when the app loads
  useEffect(() => {
    const fetchCredentials = async () => {
      const authHelpers = await getAuthHelpers();
      setReadOnlyRoleCredentials(
        authHelpers.readOnlyAuthHelper.getLocationClientConfig
      );
      setWriteOnlyRoleCredentials(
        authHelpers.writeOnlyAuthHelper.getLocationClientConfig()
      );
      setReadOnlyAuthHelper(authHelpers.readOnlyAuthHelper);
    };
    fetchCredentials();
  }, []);

  // Instantiate client for aws-sdk whenever the writeOnlyRoleCredentials change
  useEffect(() => {

    if (writeOnlyRoleCredentials != null && readOnlyRoleCredentials != null) {
      // Instantiate client for aws-sdk method calls
      const writeOnlyLocationClient = new LocationClient({
        ...writeOnlyRoleCredentials,
        region: REGION,
      });
      setWriteOnlyLocationClient(writeOnlyLocationClient);

      const readOnlyLocationClient = new LocationClient({
        ...readOnlyRoleCredentials,
        region: REGION,
      });
      setReadOnlyLocationClient(readOnlyLocationClient);

      const writeOnlySqsClient = new SQS({
        ...writeOnlyRoleCredentials,
        region: REGION,
      });
      setWriteOnlySqsClient(writeOnlySqsClient);

      const readOnlyOnlySqsClient = new SQS({
        ...readOnlyRoleCredentials,
        region: REGION,
      });
      setReadOnlySqsClient(readOnlyOnlySqsClient);

      const kinesisClient = new Kinesis({
        ...writeOnlyRoleCredentials,
        region: REGION,
      });
      setKinesisClient(kinesisClient);
    }
  }, [writeOnlyRoleCredentials]);

  useEffect(() => {
    handlePanelChange(GEOFENCES_PANEL);
  }, []);

  // Update state of the currently opened panel
  const handlePanelChange = (panel) => {
    setOpenedPanel(panel);
  };

  return (
    <>
      {writeOnlyLocationClient ? (
        <Map
          id={MAP_CONTAINER}
          style={{ height: "100vh", width: "100vw" }}
          initialViewState={{
            longitude: -122.329736,
            latitude: 47.543216,
            zoom: 15,
          }}
          mapStyle={`https://maps.geo.${REGION}.amazonaws.com/maps/v0/maps/${MAP.NAME}/style-descriptor`}
          maxZoom={16}
          {...readOnlyAuthHelper.getMapAuthenticationOptions()}
        >
          <NavigationControl position="bottom-right" />
          <GeofencesLayer
            readOnlyLocationClient={readOnlyLocationClient}
            writeOnlyLocationClient={writeOnlyLocationClient}
            isOpenedPanel={openedPanel === GEOFENCES_PANEL ? true : false}
            onPanelChange={handlePanelChange}
            isDrawing={openedInfoBox === GEOFENCE_DRAWING_MODE ? true : false}
            breachingGeofences={breachingGeofences}
            onDrawingChange={(status) =>
              status
                ? setOpenedInfoBox(GEOFENCE_DRAWING_MODE)
                : setOpenedInfoBox()
            }
          />
          <TrackersLayer
            readOnlyLocationClient={readOnlyLocationClient}
            readOnlySqsClient={readOnlySqsClient}
            writeOnlySqsClient={writeOnlySqsClient}
            kinesisClient={kinesisClient}
            isOpenedPanel={openedPanel === TRACKERS_PANEL ? true : false}
            onPanelChange={handlePanelChange}
            breachingGeofences={breachingGeofences}
            updateBreachingGeofences={setBreachingGeofences}
            isViewingDeviceHistory={openedInfoBox === DEVICE_POSITION_HISTORY_VIEWER ? true : false}
            onViewingDeviceHistoryChange={(status) =>
              status
                ? setOpenedInfoBox(DEVICE_POSITION_HISTORY_VIEWER)
                : setOpenedInfoBox()
            }
          />
        </Map>
      ) : (
          <h1>Loading...</h1>
      )}
    </>
  );
};

export default App;
