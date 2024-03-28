// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useEffect, useState, useCallback } from "react";
import {
  ListGeofencesCommand,
  BatchDeleteGeofenceCommand,
  PutGeofenceCommand,
} from "@aws-sdk/client-location";
import Button from "@cloudscape-design/components/button";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { GEOFENCE } from "../../configuration";
import GeofencesPanel from "./GeofencesPanel";
import DrawControl from "./DrawControl";
import InfoBox from "../common/InfoBox";
import DrawnGeofences from "./DrawnGeofences";
import {GEOFENCES_PANEL, TRACKERS_PANEL} from "../../constants";
import {DEMO_GEOFENCES} from "../../DemoData.js";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

// Instantiate mapbox-gl-draw
const draw = new MapboxDraw({
  displayControlsDefault: false,
  defaultMode: "simple_select",
  styles: [
    {
      id: "gl-draw-line",
      type: "line",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#636363",
        "line-width": 2,
      },
    },
    {
      id: "gl-draw-point",
      type: "circle",
      paint: {
        "circle-radius": 6,
        "circle-color": "#7AC943",
      },
    },
  ],
});

// Order polygon vertices in counter-clockwise order since that is the order PutGeofence accepts
const convertCounterClockwise = (vertices) => {
  // Determine if polygon is wound counter-clockwise using shoelace formula
  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    let j = (i + 1) % vertices.length;
    area += vertices[i][0] * vertices[j][1];
    area -= vertices[j][0] * vertices[i][1];
  }

  if (area / 2 > 0) {
    return vertices;
  } else {
    // Reverse vertices to counter-clockwise order
    return vertices.reverse();
  }
};

// Get all geofences in the collection
const callListGeofencesCommand = async (client) => {
  if (client) {
    const command = new ListGeofencesCommand({
      CollectionName: GEOFENCE,
    });

    return await client.send(command);
  }
};

// Delete geofences
const callBatchDeleteGeofenceCommand = async (client, geofenceIds) => {
  if (client) {
    const command = new BatchDeleteGeofenceCommand({
      CollectionName: GEOFENCE,
      GeofenceIds: geofenceIds,
    });

    return await client.send(command);
  }
};

// Add geofence
const callPutGeofenceCommand = async (client, polygon, geofenceId) => {
  if (client) {
    try {
      const date = new Date();
      // Generate unique geofence ID based on the date
      const id = geofenceId ? geofenceId : "Geofence-" + date.valueOf();
      const command = new PutGeofenceCommand({
        CollectionName: GEOFENCE,
        GeofenceId: id,
        Geometry: {
          Polygon: [polygon],
        },
      });
      return await client.send(command);
    } catch (error) {
      if (error.name === 'ConflictException') {
        console.log(`Geofence ${geofenceId} already exists. Skipping.`);
      }
      return null;
    }
  }
};

// Layer in the app that contains Geofences functionalities
const GeofencesLayer = ({
  readOnlyLocationClient,
  writeOnlyLocationClient,
  isOpenedPanel,
  onPanelChange,
  isDrawing,
  onDrawingChange,
  breachingGeofences
}) => {
  const [geofences, setGeofences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [geofencesVisible, setGeofencesVisible] = useState(true);
  const [isAddingGeofence, setIsAddingGeofence] = useState(false);
  const [totalGeofences, setTotalGeofences] = useState();
  const [isGeofenceCompletable, setIsGeofenceCompletable] = useState(false);
  const [hasCompletedDemoGeofences, setHasCompletedDemoGeofences] = useState(false);

  const fetchGeofences = async () => {
    setIsLoading(true);
    const fetchedGeofences = await callListGeofencesCommand(readOnlyLocationClient);
    setIsLoading(false);
    setTotalGeofences(fetchedGeofences.Entries.length);
    // Limit to only display 10 geofences
    setGeofences(fetchedGeofences.Entries.reverse().slice(0, 10));
    return fetchedGeofences.Entries;
  };

  useEffect(() => {
    const putGeofencePromises = [];
    fetchGeofences().then((existingGeofences) => {
      DEMO_GEOFENCES.forEach((geo) => {
        let alreadyExist = existingGeofences.some(geofence => geofence.GeofenceId === geo.GeofenceId);
        if (!alreadyExist) {
          const promise = callPutGeofenceCommand(writeOnlyLocationClient, geo.Polygon, geo.GeofenceId);
          if (promise) {
            putGeofencePromises.push(promise); // Ensure only defined promises are added
          }
        }
      });

      // Wait for all putGeofenceCommand calls to complete
      return Promise.all(putGeofencePromises);
    }).then(() => {
      setHasCompletedDemoGeofences(true);
    });
  }, []);

  useEffect(() => {
    if (hasCompletedDemoGeofences) {
      onPanelChange(TRACKERS_PANEL);
      fetchGeofences();
    }
  }, [hasCompletedDemoGeofences]);

  useEffect(() => {
    if (isOpenedPanel) {
      fetchGeofences();
    } else {
      // Exit out of geofence drawing mode when panel is closed
      onDrawingChange(false);
      setIsGeofenceCompletable(false);
    }
  }, [isOpenedPanel]);

  useEffect(() => {
    if (isDrawing) {
      draw.changeMode("draw_polygon");
    } else {
      draw.changeMode("simple_select");
    }
  }, [isDrawing]);

  // Delete geofences and refreshing geofences being displayed
  const handleDeleteGeofences = async (geofences) => {
    if (geofences.length > 0) {
      await callBatchDeleteGeofenceCommand(writeOnlyLocationClient, geofences);
      fetchGeofences();
    }
  };

  //Making call to PutGeofence after user complete drawing a polygon using mapbox-gl-draw
  const handleCreate = useCallback(async (e) => {
    if (e.features) {
      setIsAddingGeofence(true);
      try {
        const putGeofence = await callPutGeofenceCommand(
          writeOnlyLocationClient,
          convertCounterClockwise(e.features[0].geometry.coordinates[0])
        );
        if (putGeofence.CreateTime) {
          fetchGeofences();
          onDrawingChange(true);
          setIsAddingGeofence(false);
          // Delete features in mapbox-gl-draw as they are now rendered as polygons
          draw.deleteAll();
        }
      } catch {
        alert("There was an error adding the geofence.");
      }
    }
  }, []);

  // Exit out of drawing geofence mode when a geofence has been created or when escape key has been pressed.
  const handleModeChange = useCallback((e) => {
    // simple_select mode is entered upon completing a drawn polygon or when the escape key is pressed.
    if (e.mode === "simple_select") {
      onDrawingChange(false);
      setIsGeofenceCompletable(false);
    }
  }, []);

  // Helps track if the user has began drawing a geofence by plotting a single point
  const handleGeofenceCompletable = (completable) => {
    setIsGeofenceCompletable(completable);
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "1.5rem",
          left: "1.5rem",
          width: "10rem",
          alignItems: "center",
          display: 'inline-flex', textWrap: 'nowrap', textAlign: 'start'
        }}
      >
        <Button
          onClick={() => {
            isOpenedPanel ? onPanelChange() : onPanelChange(GEOFENCES_PANEL);
          }}
          iconSvg={
            <svg
                viewBox="0 0 48 48"
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M42.0827316,24.0408067 L33.4677316,24.4158067 L29.9577316,12.7148067 C29.8167316,12.2448067 29.3517316,11.9538067 28.8707316,12.0098067 L21.6217316,12.9558067 L21.9567316,5.9258067 L43.8957316,4.0968067 L42.0827316,24.0408067 Z M21.5247316,14.9848067 L28.2857316,14.1028067 L31.4067316,24.5048067 L21.0507316,24.9548067 L21.5247316,14.9848067 Z M33.8487316,32.6428067 L19.7287316,43.9378067 L4.1017316,41.1808067 L6.9037316,16.8928067 L19.5107316,15.2478067 L19.0007316,25.9548067 C18.9867316,26.2348067 19.0927316,26.5078067 19.2907316,26.7078067 C19.4787316,26.8958067 19.7337316,27.0018067 19.9997316,27.0018067 C20.0147316,27.0018067 20.0287316,27.0008067 20.0427316,27.0008067 L31.9997316,26.4808067 L33.8487316,32.6428067 Z M45.7097316,2.2968067 C45.5017316,2.0868067 45.2087316,1.9748067 44.9167316,2.0048067 L20.9167316,4.0048067 C20.4167316,4.0468067 20.0247316,4.4528067 20.0007316,4.9548067 L19.6067316,13.2188067 L5.8707316,15.0098067 C5.4147316,15.0698067 5.0597316,15.4308067 5.0067316,15.8868067 L2.0067316,41.8868067 C1.9457316,42.4128067 2.3057316,42.8948067 2.8257316,42.9868067 L19.8257316,45.9868067 C19.8837316,45.9968067 19.9417316,46.0018067 19.9997316,46.0018067 C20.2257316,46.0018067 20.4457316,45.9258067 20.6247316,45.7828067 L35.6247316,33.7828067 C35.9427316,33.5278067 36.0747316,33.1048067 35.9577316,32.7148067 L34.0607316,26.3918067 L43.0427316,26.0008067 C43.5437316,25.9788067 43.9497316,25.5908067 43.9957316,25.0918067 L45.9957316,3.0918067 C46.0217316,2.7978067 45.9177316,2.5068067 45.7097316,2.2968067 L45.7097316,2.2968067 Z"></path>
            </svg>
          }
        >
          Geofences
        </Button>
      </div>
      {isOpenedPanel && (
        <GeofencesPanel
          onClose={() => onPanelChange()}
          geofences={geofences}
          onDeleteGeofences={handleDeleteGeofences}
          onAddGeofence={() => onDrawingChange(true)}
          isLoading={isLoading}
          geofencesVisible={geofencesVisible}
          onToggleGeofences={() => setGeofencesVisible((prev) => !prev)}
          totalGeofences={totalGeofences}
        />
      )}
      <DrawControl
          draw={draw}
          onCreate={handleCreate}
          onModeChange={handleModeChange}
          onGeofenceCompletable={handleGeofenceCompletable}
      />
      {(isDrawing || isAddingGeofence) && (
        <InfoBox header="Geofence Drawing Mode">
          {isAddingGeofence ? (
            <p>Adding geofence...</p>
          ) : isGeofenceCompletable ? (
            <>
              <p>Add points to your geofence.</p>
              <p>
                Click on the initial point to complete the geofence. A geofence
                must have at least 3 points.
              </p>
              <p>To cancel, click on the Exit button.</p>
            </>
          ) : (
            <p>Click on the map to start drawing a geofence.</p>
          )}
          <Button
            variation="primary"
            size="small"
            onClick={() => onDrawingChange(false)}
          >
            Exit
          </Button>
        </InfoBox>
      )}
      <DrawnGeofences
        geofences={geofences}
        breachingGeofences={breachingGeofences}
        geofencesVisible={geofencesVisible}
      />
    </>
  );
};

export default GeofencesLayer;
