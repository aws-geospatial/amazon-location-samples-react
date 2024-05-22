// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useEffect, useState } from "react";
import {
  ListDevicePositionsCommand,
  GetDevicePositionHistoryCommand, PutGeofenceCommand,
} from "@aws-sdk/client-location";
import Button from "@cloudscape-design/components/button";
import TrackersPanel from "./TrackersPanel";
import {DEVICE_POSITION_HISTORY_OFFSET, KINESIS_DATA_STREAM_NAME, TRACKER} from "../../configuration";
import Devices from "./Devices";
import DevicePositionHistory from "./DevicePositionHistory";
import InfoBox from "../common/InfoBox";
import { TRACKERS_PANEL } from "../../constants";
import {
  DEMO_POSITION_UPDATE_INTERVAL,
  POSITION_UPDATES_TRUCK_1,
  POSITION_UPDATES_TRUCK_2
} from "../../DemoData.js";
import {DeleteMessageCommand, GetQueueUrlCommand, ReceiveMessageCommand} from "@aws-sdk/client-sqs";
import {PutRecordsCommand} from "@aws-sdk/client-kinesis";

// Get all devices in the collection
const callListDevicePositionsCommand = async (locationClient) => {
  if (locationClient) {
    const command = new ListDevicePositionsCommand({
      TrackerName: TRACKER,
    });
    return await locationClient.send(command);
  }
};

// Get device history
const callGetDevicePositionHistoryCommand = async (locationClient, deviceId) => {
  if (locationClient) {
    const currentTime = new Date();
    const command = new GetDevicePositionHistoryCommand({
      TrackerName: TRACKER,
      DeviceId: deviceId,
      // Device position history from the past hour
      StartTimeInclusive: new Date(currentTime.getTime() - DEVICE_POSITION_HISTORY_OFFSET * 1000),
    });

    return await locationClient.send(command);
  }
};

const callGetQueueUrl = async (sqsClient) => {
  const command = new GetQueueUrlCommand({
    QueueName: 'TrackingAndGeofencingSampleGeofenceEventQueue'
  });
  return await sqsClient.send(command);
}

const callReceiveMessage = async (sqsClient, queueUrl) => {
  const params = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 5
  };
  const command = new ReceiveMessageCommand(params);
  return await sqsClient.send(command);
};

const callDeleteMessage = async (sqsClient, message, queueUrl) => {
  const params = {
    QueueUrl: queueUrl,
    ReceiptHandle: message.ReceiptHandle,
  };
  const command = new DeleteMessageCommand(params);
  return await sqsClient.send(command);
};

const callPutRecords = (kinesisClient, updates, streamName) => {
  const records = [];
  updates.forEach((update) => {
    update.Data.Time = new Date().toISOString();
    records.push({
      PartitionKey: update.PartitionKey,
      Data: new TextEncoder().encode(JSON.stringify(update.Data))
    });
  });
  const params = {
    Records: records,
    StreamName: streamName,
  };
  const command = new PutRecordsCommand(params);
  return kinesisClient.send(command);
}

// Layer in the app that contains Trackers functionalities
const TrackersLayer = ({
  readOnlyLocationClient,
  readOnlySqsClient,
  writeOnlySqsClient,
  kinesisClient,
  isOpenedPanel,
  onPanelChange,
  breachingGeofences,
  updateBreachingGeofences,
  isViewingDeviceHistory,
  onViewingDeviceHistoryChange,
}) => {
  const [devices, setDevices] = useState([]);
  const [areDevicesVisible, setAreDevicesVisible] = useState(true);
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [deviceIdHistory, setDeviceIdHistory] = useState();
  const [deviceHistoryEntries, setDeviceHistoryEntries] = useState([]);
  const [demoNotifications, setDemoNotifications] = useState([]);
  const [pendingNotifications, setPendingNotifications] = useState([]);
  const fetchDevicePositions = async () => {
    const fetchedDevices = await callListDevicePositionsCommand(readOnlyLocationClient);
    const sorted = fetchedDevices.Entries.sort((a, b) => {
      return a.SampleTime < b.SampleTime ? 1 : -1;
    });
    setDevices(sorted);
  };

  const fetchDevicePositionHistory = async (deviceId) => {
    const fetchedDeviceHistory = await callGetDevicePositionHistoryCommand(readOnlyLocationClient, deviceId);
    // Display current position if there are no other device position history
    if (fetchedDeviceHistory.DevicePositions.length === 0 && devices.length > 0) {
      // Find selected device from all current devices
      const selectedDevice = devices.filter((device) => device.DeviceId === deviceId);
      // Store currently selected device position into state for device position history viewer
      setDeviceHistoryEntries(selectedDevice);
    } else {
      // Store fetched device position history into state for device position history viewer
      setDeviceHistoryEntries(fetchedDeviceHistory.DevicePositions);
    }
  };

  const pollSQS = async (readOnlySqsClient, writeOnlySqsClient, queueUrl) => {
    const response = await callReceiveMessage(readOnlySqsClient, queueUrl);
    if (response.Messages && response.Messages.length > 0) {
      let isDuplicate = false;
      response.Messages.forEach((msg) => {
        const deserialized = JSON.parse(msg.Body);
        demoNotifications.forEach((notification) => {
          if (deserialized.id === notification.id) {
            isDuplicate = true;
          }
        });
        if (!isDuplicate) {
          setDemoNotifications((prev) => [...prev, deserialized]);
          setPendingNotifications((prev) => [...prev, deserialized]);
          callDeleteMessage(writeOnlySqsClient, msg, queueUrl); // clean up the polled message.
        }
      });
    }
  }

  const startPollingSQS = async () => {
    const response = await callGetQueueUrl(readOnlySqsClient);
    const interval = setInterval(() => {
      pollSQS(readOnlySqsClient, writeOnlySqsClient, response.QueueUrl);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }

  const startPollingDevicePosition = async () => {
    const interval = setInterval(() => {
      fetchDevicePositions();
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }

  const onDemo = () => {
    console.log("Starting demo.");
    setIsRunningDemo(true);
    demoNotifications.length = 0;
    const maxLen = Math.max(POSITION_UPDATES_TRUCK_1.length, POSITION_UPDATES_TRUCK_2.length);
    let i = 0
    while (i < maxLen) {
      const updates = [];
      if (i < POSITION_UPDATES_TRUCK_1.length) {
        updates.push(POSITION_UPDATES_TRUCK_1[i]);
      }
      if (i < POSITION_UPDATES_TRUCK_2.length) {
        updates.push(POSITION_UPDATES_TRUCK_2[i]);
      }
      setTimeout(() => callPutRecords(kinesisClient, updates, KINESIS_DATA_STREAM_NAME), i * DEMO_POSITION_UPDATE_INTERVAL)
      i++;
    }
    setTimeout(() => {
      setIsRunningDemo(false);
    }, (maxLen + 1) * DEMO_POSITION_UPDATE_INTERVAL);
  }

  const onNotificationReceived = (notification) => {
    let updatedBreachingGeofences = [...breachingGeofences];
    if (notification.detail.EventType === 'ENTER') {
      if (!updatedBreachingGeofences.includes(notification.detail.GeofenceId)) {
        updatedBreachingGeofences.push(notification.detail.GeofenceId);
      }
    }
    if (notification.detail.EventType === 'EXIT') {
      const index = updatedBreachingGeofences.indexOf(notification.detail.GeofenceId);
      if (index > -1) {
        updatedBreachingGeofences.splice(index, 1);
      }
    }
    updateBreachingGeofences(updatedBreachingGeofences);
  }

  useEffect(() => {
    if (pendingNotifications.length > 0) {
      pendingNotifications.forEach(notification => onNotificationReceived(notification));
      setPendingNotifications([]);
    }
  }, [pendingNotifications]);

  useEffect(() => {
    if (isViewingDeviceHistory) {
      fetchDevicePositionHistory(deviceIdHistory);
    } else {
      // Clear specified device for device position history
      setDeviceIdHistory();
    }
  }, [isViewingDeviceHistory]);

  useEffect(() => {
    let cleanupSqs;

    const startPolling = async () => {
      if (isRunningDemo) {
        cleanupSqs = await startPollingSQS();
      }
    };

    startPolling();

    return () => {
      if (cleanupSqs) cleanupSqs();
    };
  }, [isRunningDemo]);

  useEffect(() => {
    let cleanupDevicePositionPoll;

    const startPolling = async () => {
      if (isOpenedPanel) {
        cleanupDevicePositionPoll = await startPollingDevicePosition();
      }
    };

    startPolling();

    return () => {
      if (cleanupDevicePositionPoll) cleanupDevicePositionPoll();
    };
  }, [isOpenedPanel]);

  const handleViewDeviceHistory = (deviceId) => {
    // Specify which device to look into for the history
    setDeviceIdHistory(deviceId);
    // Turn on viewing device history
    onViewingDeviceHistoryChange(true);
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "1.5rem",
          left: "12rem",
        }}
      >
        <Button
          onClick={() => {
            isOpenedPanel ? onPanelChange() : onPanelChange(TRACKERS_PANEL);
          }}
          iconSvg={
            <svg viewBox="0 0 48 48" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M42,24 C40.897,24 40,23.103 40,22 C40,20.897 40.897,20 42,20 C43.103,20 44,20.897 44,22 C44,23.103 43.103,24 42,24 M30,37 C28.897,37 28,36.103 28,35 C28,33.897 28.897,33 30,33 C31.103,33 32,33.897 32,35 C32,36.103 31.103,37 30,37 M20,27 C20,25.897 20.897,25 22,25 C23.103,25 24,25.897 24,27 C24,28.103 23.103,29 22,29 C20.897,29 20,28.103 20,27 M6,44 C4.897,44 4,43.103 4,42 C4,40.897 4.897,40 6,40 C7.103,40 8,40.897 8,42 C8,43.103 7.103,44 6,44 M23,6 C23,4.897 23.897,4 25,4 C26.103,4 27,4.897 27,6 C27,7.103 26.103,8 25,8 C23.897,8 23,7.103 23,6 M6,8 C4.897,8 4,7.103 4,6 C4,4.897 4.897,4 6,4 C7.103,4 8,4.897 8,6 C8,7.103 7.103,8 6,8 M42,18 C40.998,18 40.093,18.383 39.391,18.993 L28.34,8.19 C28.755,7.561 29,6.809 29,6 C29,3.794 27.206,2 25,2 C23.142,2 21.589,3.28 21.142,5 L9.858,5 C9.411,3.28 7.858,2 6,2 C3.794,2 2,3.794 2,6 C2,8.206 3.794,10 6,10 C7.858,10 9.411,8.72 9.858,7 L21.142,7 C21.589,8.72 23.142,10 25,10 C25.67,10 26.291,9.819 26.847,9.527 L38.245,20.669 C38.096,21.088 38,21.531 38,22 C38,22.792 38.238,23.526 38.637,24.147 L31.845,31.472 C31.29,31.181 30.669,31 30,31 C29.15,31 28.366,31.27 27.718,31.723 L25.092,29.506 C25.651,28.818 26,27.953 26,27 C26,24.794 24.206,23 22,23 C19.794,23 18,24.794 18,27 C18,27.661 18.177,28.275 18.461,28.825 L8.05,38.583 C7.448,38.221 6.752,38 6,38 C3.794,38 2,39.794 2,42 C2,44.206 3.794,46 6,46 C8.206,46 10,44.206 10,42 C10,41.273 9.79,40.6 9.45,40.011 L19.783,30.326 C20.419,30.75 21.181,31 22,31 C22.507,31 22.986,30.896 23.433,30.723 L26.422,33.247 C26.16,33.779 26,34.369 26,35 C26,37.206 27.794,39 30,39 C32.206,39 34,37.206 34,35 C34,34.189 33.754,33.436 33.337,32.804 L40.108,25.502 C40.674,25.81 41.313,26 42,26 C44.206,26 46,24.206 46,22 C46,19.794 44.206,18 42,18"></path>
            </svg>
          }
        >
          Trackers
        </Button>
      </div>
      {isOpenedPanel && (
        <TrackersPanel
          onClose={() => onPanelChange()}
          onDemo={() => onDemo()}
          areDevicesVisible={areDevicesVisible}
          onToggleDevices={() => setAreDevicesVisible((prev) => !prev)}
          isViewingDeviceHistory={isViewingDeviceHistory}
          devices={devices}
          isRunningDemo={isRunningDemo}
          notifications={demoNotifications}
        />
      )}
      {areDevicesVisible && !isViewingDeviceHistory && !deviceIdHistory && (
        <Devices devices={devices} onViewDeviceHistory={handleViewDeviceHistory} />
      )}
      {areDevicesVisible && isViewingDeviceHistory && deviceIdHistory && (
        <>
          <DevicePositionHistory deviceHistoryEntries={deviceHistoryEntries} />
          <InfoBox header="Device Position History Viewer">
            <p>
              Viewing <strong>{deviceIdHistory}</strong> device position history.
            </p>
            <p>To view current positions of all devices, click on the Exit button.</p>
            <Button
              variant="primary"
              onClick={() => onViewingDeviceHistoryChange(false)}
            >
              Exit
            </Button>
          </InfoBox>
        </>
      )}
    </>
  );
};

export default TrackersLayer;
