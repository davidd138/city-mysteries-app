'use client';

import { Amplify } from 'aws-amplify';

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'eu-west-1_GmQzkNtro',
      userPoolClientId: '5gkum44rc048qftbovgssnsjod',
    },
  },
  API: {
    GraphQL: {
      endpoint: 'https://s2gfaytqlbgmndcmfhfvwmj36y.appsync-api.eu-west-1.amazonaws.com/graphql',
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
