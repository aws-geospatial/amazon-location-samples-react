# Device Position Streaming Sample App

This sample app includes a demo for:
1. Streaming device position updates to Amazon Location Service via Kinesis
2. Displaying devices and geofences on a map
3. Consuming geofence breaching notifications

## Dependencies

[`maplibre-gl`](https://maplibre.org/maplibre-gl-js/docs/) and [`react-map-gl`](https://visgl.github.io/react-map-gl/): Renders map-related components.

[`@aws-sdk`](https://github.com/aws/aws-sdk-js-v3): Allows making requests to Amazon Location Service, Amazon SQS and Amazon Kinesis.

[`@cloudscape-design`](https://cloudscape.design/):  Provides styles and UI components.

[`@mapbox/mapbox-gl-draw`](https://github.com/mapbox/mapbox-gl-draw): Provides drawing capability to help create geofences.

[`@aws/amazon-location-utilities-auth-helper`](https://github.com/aws-geospatial/amazon-location-utilities-auth-helper-js): 
Javascript AWS authentication helper. Owned by Amazon Location.

See more in [`package.json`](package.json)

This app has been tested on Node.js v20.11.0 and NPM v9.5.0

## Getting started

1. Install commandline dependencies:
   [`Node.js`](https://nodejs.org), [`AWS CLI`](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
2. Install project dependencies: run `npm install` from the sample app location on your computer.
3. Follow [`AWS CLI credential setup`](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html) to configure authentication tokens for your CLI.
4. Deploy CloudFormation resources via command `./deploy_cloudformation` from the project's root directory. 
You may need to run `chmod +x ./deploy_cloudformation.sh` before running the script for the first time to setup the permission to run it.
5. Fill in required fields for Amazon Cognito and Amazon Location Service in [`src/configuration.js`](src/configuration.js). 
The identity pool ids are generated as part of the CloudFormation deployment and can be found in the Output of the TrackingAndGeofencingSample stack.
6. Start the app: run `npm start` from the sample app location on your computer.
7. Open http://localhost:8080/ on a browser to access the app.
8. Click on the "Run Demo" button to start the demo. For demo purposes, this demo uses mocked device positions near an Amazon warehouse.

## Customization

This app allows using your customized geofence and device position to execute the demo.

### Custom geofence
1. Go to the "Geofence" tab on the UI.
2. Pan the map to find your desired geofence position.
3. Click on the "Add" button.
4. Start drawing the new polygon geofence. Note the last vertex must overlap the first vertex to enclose the geofence.

Alternatively, go to [DemoData.js](./src/DemoData.js) and put your geofences under `DEMO_GEOFENCES`. The geofences will be created on web page refresh.

### Custom device positions

Device positions for the demo is stored in [DemoData.js](./src/DemoData.js). Follow the format of device positions there to enter your own data.

## Authentication Best Practice

This sample app uses two [Unauthenticated Cognito Identity Pool roles](https://docs.aws.amazon.com/location/latest/developerguide/authenticating-using-cognito.html):
1. A read-only role which allows only read access such as `geo:ListGeofences` and `sqs:ReceiveMessage`, etc.
2. A write-only role which allows only write access such as `geo:PutGeofence` and `kinesis:PutRecords`, etc.

The separation follows the [Principle of Least Privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege).

## Security

See [CONTRIBUTING](./CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the [LICENSE](./LICENSE) file.
