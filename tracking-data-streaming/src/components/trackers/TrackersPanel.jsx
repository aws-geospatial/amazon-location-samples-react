// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import Panel from "../common/Panel";
import styles from "./TrackersPanel.module.css";
import {DEVICE_POSITION_HISTORY_OFFSET, TRACKER} from "../../configuration";
import {Header, Box, Button, SpaceBetween, Table} from "@cloudscape-design/components";

// Popup panel for Trackers
const TrackersPanel = ({
  onClose,
  onToggleDevices,
  onDemo,
  areDevicesVisible,
  devices,
  isRunningDemo,
  notifications
}) => {
  let currentDisplayIndex = 0;
  const PAGE_SIZE = 5;
  return (
      <Panel
          header={
            <div className={styles.header} onClick={onDemo}>
              <Header variant="h2"
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button variant="primary" disabled={isRunningDemo}>
                      Run Demo
                    </Button>
                  </SpaceBetween>
                }
              >Trackers</Header>
            </div>
          }
          footer={
            <>
              <Button onClick={onClose}>
                Close
              </Button>
              <Button onClick={onToggleDevices}>
                {areDevicesVisible ? "Hide" : "Show"} All Devices
              </Button>
            </>
          }
      >
        <div className={styles.field}>
          <div className={styles.field__label}>Tracker Name</div>
          <div className={styles.field__value}>{TRACKER}</div>
        </div>
        {isRunningDemo ? (
            <div>The demo is running.</div>
        ) : (
            <div>Click on the Run Demo button to execute the demo.</div>
        )
        }
        <div className={styles.device}>Devices</div>
        {devices?.length > 0 ? (
            <>
              <Table
                 columnDefinitions={[
                   {
                     id: "deviceId",
                     header: "Device Id",
                     cell: item => item.deviceId || ""
                   },
                   {
                     id: "sampleTime",
                     header: "Last Updated Time",
                     cell: item => item.sampleTime || ""
                   }
                 ]}
                 wrapLines
                 items={[...(devices?.slice(currentDisplayIndex, PAGE_SIZE).map((device) => {
                   return {
                     deviceId: device.DeviceId,
                     sampleTime: device.SampleTime.toTimeString()
                   }
                 }))
                 ]}
                 selectedItems={[devices[0]]}
                 empty={
                   <Box
                       margin={{ vertical: "xs" }}
                       textAlign="center"
                       color="inherit"
                   >
                     <SpaceBetween size="m">
                       <b>No devices</b>
                     </SpaceBetween>
                   </Box>
                 }
              >
              </Table>
              {devices.length > PAGE_SIZE && (
                  <em>
                    Displaying {PAGE_SIZE} of {devices.length} devices.
                  </em>
              )}
            </>
        ) : (
            devices?.length === 0 && (
                <div className={styles.empty}>
                  <div className={styles.empty__header}>There are no devices to list.</div>
                  <div className={styles.empty__body}>
                    There is no device position history in the past {DEVICE_POSITION_HISTORY_OFFSET} seconds.
                  </div>
                </div>
            )
        )}
        <div className={styles.footnote}>
          <em>
            Device positions are refreshed every second during demo.
          </em>
        </div>
        <div>
          <em>
            Click on a device's icon to view more information and device position history.
          </em>
        </div>
        <div className={styles.notification}>Notifications Received</div>
        {notifications.length > 0 ? (
            <Table
                 columnDefinitions={[
                   {
                     id: "deviceId",
                     header: "Device Id",
                     cell: item => item.deviceId || ""
                   },
                   {
                     id: "event",
                     header: "Event",
                     cell: item => {
                       if (item.eventType === "ENTER") {
                         return `Device ${item.deviceId} has entered ${item.geofenceId}`;
                       } else if (item.eventType === "EXIT") {
                         return `Device ${item.deviceId} has left ${item.geofenceId}`;
                       }
                       return ""
                     }
                   }
                 ]}
                 wrapLines
                 items={[...(notifications?.map((notification) => {
                   return {
                     deviceId: notification.detail.DeviceId,
                     eventType: notification.detail.EventType,
                     geofenceId: notification.detail.GeofenceId
                   }
                 }))
                 ]}
                 empty={
                   <Box
                       margin={{ vertical: "xs" }}
                       textAlign="center"
                       color="inherit"
                   >
                     <SpaceBetween size="m">
                       <b>No notifications</b>
                     </SpaceBetween>
                   </Box>
                 }
            >
            </Table>
        ) : (
            <div className={styles.empty}>
              <div className={styles.empty__body}>
                There are no notifications yet.
              </div>
            </div>
        )}
        <div className={styles.footnote}>
          <em>
            Notifications are sent to Amazon EventBridge when a device enters/exits a geofence collection that is
            associated with the tracker.
          </em>
        </div>
        <div className={styles.footnote}>
          <em>
            This demo app's backend sends notifications to CloudWatch logs and SQS via EventBridge. This UI polls from
            SQS every second during demo.
          </em>
        </div>
      </Panel>
  );
};

export default TrackersPanel;
