'use client';

import { Amplify } from 'aws-amplify';

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'eu-west-1_PLACEHOLDER',
      userPoolClientId: 'PLACEHOLDER',
    },
  },
  API: {
    GraphQL: {
      endpoint: 'https://PLACEHOLDER.appsync-api.eu-west-1.amazonaws.com/graphql',
      defaultAuthMode: 'userPool' as const,
    },
  },
};

let configured = false;

export function configureAmplify() {
  if (!configured) {
    Amplify.configure(awsConfig);
    configured = true;
  }
}
