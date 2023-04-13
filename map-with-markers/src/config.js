// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {Amplify} from "aws-amplify";

const appConfig = {
      VITE_IDENTITY_POOL: import.meta.env.VITE_IDENTITY_POOL_ID,
      VITE_REGION: import.meta.env.VITE_REGION,
      MAP_NAME: import.meta.env.VITE_MAP_NAME,
      MAP_STYLE: import.meta.env.VITE_MAP_STYLE,
};

// Configure Amplify
Amplify.configure({
      Auth: {
            // (required) Amazon Cognito Identity Pool ID
            identityPoolId: appConfig.VITE_IDENTITY_POOL,
            // (required) Amazon Cognito Region
            region: appConfig.VITE_REGION,
      },
      geo: {
            AmazonLocationService: {
                  maps: {
                        items: {
                              [appConfig.MAP_NAME]: {
                                    style: appConfig.MAP_STYLE,
                              },
                        },
                        default: appConfig.MAP_NAME,
                  },
                  region: appConfig.VITE_REGION,
            },
      },
});
