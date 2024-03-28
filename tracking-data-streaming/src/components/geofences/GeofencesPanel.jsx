// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useState } from "react";
import { Header, Button, SpaceBetween, Table } from "@cloudscape-design/components";
import Panel from "../common/Panel";
import Spinner from "../common/Spinner";
import styles from "./GeofencesPanel.module.css";
import { GEOFENCE } from "../../configuration";

// Popup panel for Geofences
const GeofencesPanel = ({
  onClose,
  geofences,
  onDeleteGeofences,
  onAddGeofence,
  isLoading,
  onToggleGeofences,
  geofencesVisible,
  totalGeofences,
}) => {
  const [selectedItems, setSelectedItems] = useState([]);

  // Help keep track of which checkboxes are selected
  const handleSelectionChange = (e) => {
    setSelectedItems(e.detail.selectedItems);
  };

  const handleDeleteGeofences = () => {
    onDeleteGeofences(selectedItems.map((item) => item.geofenceId));
    setSelectedItems([]);
  };

  return (
    <Panel
      header={
        <div className={styles.header}>
          <Header variant="h2"
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button onClick={handleDeleteGeofences}>
                    Remove
                  </Button>
                  <Button variant="primary" onClick={onAddGeofence}>
                    Add
                  </Button>
                </SpaceBetween>
              }
          >Geofences</Header>
        </div>
      }
      footer={
        <>
          <Button onClick={onClose}>
            Close
          </Button>
          <Button onClick={onToggleGeofences}>
            {geofencesVisible ? "Hide" : "Show"} All Geofences
          </Button>
        </>
      }
    >
      {isLoading ? (
        <Spinner />
      ) : geofences?.length > 0 ? (
        <div>
          <div className={styles.collection}>{GEOFENCE}</div>
          <Table
              onSelectionChange={handleSelectionChange}
              selectedItems={selectedItems}
              selectionType="multi"
              trackBy="geofenceId"
              columnDefinitions={[
                {
                  id: "geofenceId",
                  header: "Geofence Id",
                  cell: item => item.geofenceId || ""
                }
              ]}
              items={[...(geofences?.map((geofence) => {
                  return {
                    geofenceId: geofence.GeofenceId,
                  }
                }))
              ]}
              />
          {totalGeofences > 10 && (
            <em className={styles.max}>
              Displaying {geofences?.length} of {totalGeofences} geofences
            </em>
          )}
        </div>
      ) : (
        geofences?.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.empty__header}>There are no geofences.</div>
            <div className={styles.empty__body}>
              Use the Add button to create a geofence. After you draw one or more geofences, they
              will show up here.
            </div>
          </div>
        )
      )}
    </Panel>
  );
};

export default GeofencesPanel;
