#!/bin/bash

# Configurable variables
TrackerName="SampleTracker"

# SAR application id for kinesis-stream-device-data-to-amazon-location-tracker app
ApplicationId="arn:aws:serverlessrepo:us-east-1:003883091127:applications/kinesis-stream-device-data-to-amazon-location-tracker"

if [ -z "$AWS_REGION" ]; then
  echo "Error: AWS_REGION is not set. You may set the environment variable with this command: 'export AWS_REGION=<your region>'."
  exit 1
fi

echo "Deploying kinesis data stream template for sample app."

aws cloudformation deploy \
  --template-file src/cfn_template/kinesisResources.yml \
  --stack-name TrackingAndGeofencingSampleKinesisStack \
  --region ${AWS_REGION} \

echo "Retrieving TrackingAndGeofencingSampleKinesisDataStreamARN from the created CloudFormation stack."

# Retrieve the KinesisDataStreamARN output from the deployed stack
KinesisDataStreamARN=$(aws cloudformation describe-stacks \
  --stack-name TrackingAndGeofencingSampleKinesisStack \
  --query "Stacks[0].Outputs[?OutputKey=='TrackingAndGeofencingSampleKinesisDataStreamARN'].OutputValue" \
  --output text \
  --region ${AWS_REGION})

# Check if KinesisDataStreamARN was retrieved successfully
if [ -z KinesisDataStreamARN ]; then
  echo "Error: Failed to retrieve TrackingAndGeofencingSampleKinesisDataStreamARN from CloudFormation stack."
  exit 1
fi

echo "Creating changeset kinesis-stream-device-data-to-location-tracker Serverless Application with kinesis data stream: $KinesisDataStreamARN."

ChangeSetName="kinesis-stream-device-data-to-location-tracker-change-set"
SarStackName="kinesis-stream-device-data-to-location-tracker-app-stack"

ChangeSetId=$(aws serverlessrepo create-cloud-formation-change-set \
  --application-id ${ApplicationId} \
  --capabilities CAPABILITY_IAM \
  --region ${AWS_REGION} \
  --stack-name $SarStackName \
  --change-set-name $ChangeSetName \
  --parameter-overrides Name="TrackerName",Value="${TrackerName}" Name="EventBridgeEnabled",Value="true" Name="KinesisStreamArn",Value="${KinesisDataStreamARN}" \
  --query 'ChangeSetId' \
  --output text)

# Check if ChangeSetId was captured successfully
if [ -z "$ChangeSetId" ] ; then
  echo "Error: Failed to capture ChangeSetId from the create-cloud-formation-change-set output."
  exit 1
fi

# Sleep for 5 seconds to allow the change set to be created.
sleep 5
Changes=$(aws cloudformation describe-change-set --change-set-name $ChangeSetName --stack-name "serverlessrepo-$SarStackName" --query "Changes" --output text)
echo $Changes
if [[ -z "$Changes" || "$Changes" = "None" ]]; then
  echo "No changes to deploy. Stack serverlessrepo-$SarStackName is up to date."
else
  echo "Executing change set: $ChangeSetId"

  # Retry logic for executing the change set to avoid calling the execute API too fast.
  max_attempts=5
  attempt=1
  while [ $attempt -le $max_attempts ]; do
    echo "Attempt $attempt of $max_attempts: Executing change set $ChangeSetId"

    execute_output=$(aws cloudformation execute-change-set --change-set-name $ChangeSetId --region $AWS_REGION 2>&1)
    execute_status=$?

    if [ $execute_status -eq 0 ]; then
      echo "Change set executed successfully: $ChangeSetId. You can go to CloudFormation's console to monitor the deployment progress."
      break
    fi

    if [ $attempt -eq $max_attempts ]; then
      echo "Maximum execution attempts reached, failing execution."
      exit 1
    fi

    ((attempt++))
    sleep 1
  done
fi

sleep 2 # Wait for 2 seconds for the previous stack deployment to finish the tracker creation.
echo "Deploying cloudformation template for sample app using TrackerName: $TrackerName and region: $AWS_REGION."

aws cloudformation deploy \
  --template-file src/cfn_template/locationResources.yml \
  --stack-name TrackingAndGeofencingSample \
  --parameter-overrides TrackerName=${TrackerName} \
  --region ${AWS_REGION} \
  --capabilities CAPABILITY_NAMED_IAM

echo "All deployments complete!"
