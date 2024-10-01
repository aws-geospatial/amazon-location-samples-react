# Display markers on a web map using React

This example demonstrates how to display markers on a web map using [React](https://react.dev/), [react-map-gl](https://visgl.github.io/react-map-gl/). It uses [Amazon Location Service's Maps](https://aws.amazon.com/location/) as the base map provider and [MapLibre GL JS](https://maplibre.org/maplibre-gl-js-docs/api/) (via [react-map-gl](https://visgl.github.io/react-map-gl/)) as the map rendering library.

## Create resources

Click the button below to create the necessary AWS resources for this sample app to run. It will open the AWS Management Console and initiate the CloudFormation template deployment process.

[![Launch Stack](https://amazon-location-cloudformation-templates.s3.us-west-2.amazonaws.com/cfn-launch-stack-button.svg)](https://console.aws.amazon.com/cloudformation/home?#/stacks/quickcreate?stackName=react-map-with-markers-example&templateURL=https://amazon-location-cloudformation-templates.s3.us-west-2.amazonaws.com/samples/web-react-map-with-markers/template.yaml)

Once the deployment process is complete, go to the **Outputs** section to get the Amazon Location Maps ApiKey, AWS Region.

## Configure

Copy `.env.example` to `.env` and populate environment variables with the CloudFormation stack outputs.

## Run

Run `npm start` to start a local web server on [`localhost:3000`](http://localhost:3000/) with this example and open it in a browser.

## Clean up

To remove all of the resources created in this walkthrough, delete the CloudFormation stack named `react-map-with-markers`.

## Get help

- Have a bug to report? [Open an issue](https://github.com/aws-geospatial/amazon-location-samples-react/issues/new). If possible, include details about your development environment, and an example that shows the issue.
- Have an example request? [Open an issue](https://github.com/aws-samples/amazon-location-samples/issues/new). Tell us what the example should do and why you want it.

## Contribute

See [CONTRIBUTING](../CONTRIBUTING.md) for more information.

## Security

See [CONTRIBUTING](../CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the [LICENSE](../LICENSE) file.
