// @flow

import AWS from 'aws-sdk';

export interface AwsCredentials {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
}

export default function (IdentityPoolId: string): Promise<AwsCredentials> {
    return new Promise((resolve, reject) =>{
        AWS.config.region = 'us-west-2';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId });
        AWS.config.credentials.get(() => {
            if (AWS.config.credentials.expired) {
                reject('Unable to obtain valid Cognito credentials.');
            }
            resolve(AWS.config.credentials);
        });
    });
}