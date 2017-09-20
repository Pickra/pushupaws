// @flow

import EventEmitter from 'events';
import awsIoT from 'aws-iot-device-sdk';

import type { AwsCredentials } from './authorize';

export type SubscriberListener = (topic: string, message: any) => void;
export type ConnectionState = 'NOT CONNECTED' | 'CONNECTED' | 'CONNECTION ERROR';
export interface IoTDevice extends EventEmitter {
    subscribe: (string) => void;
}

export default class IoTConnection extends EventEmitter {
    status: ConnectionState;
    region: string;
    endpoint: string;
    clientId: string;
    error: Error;
    client: IoTDevice;

    static connectionStates = [
        'NOT CONNECTED',
        'CONNECTED',
        'CONNECTION ERROR',
    ];

    constructor(region: string, endpoint: string, clientId: string) {
        super();
        this.status = 'NOT CONNECTED';
        this.region = region;
        this.endpoint = endpoint;
        this.clientId = clientId;

        this.on('connect', this.onConnect);
        this.on('error', this.onError);
        this.on('close', this.onClose);
    }

    connect(credentials: AwsCredentials) {
        this.client = awsIoT.device({
            region: this.region,
            host: this.endpoint,
            port: 443,
            protocol: 'wss',
            clientId: this.clientId,
            accessKeyId: credentials.accessKeyId,
            secretKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken,
        });
        this.configureClient();
    }

    onConnect = () => {
        this.status = 'CONNECTED';
    };

    onError = (err: Error) => {
        this.status = 'CONNECTION ERROR';
        this.error = err;
    };

    onClose = () => {
        this.status = 'NOT CONNECTED';
    };

    configureClient() {
        this.client.on('connect', () => this.emit('connect'));
        this.client.on('error', err => this.emit('error', err));
        this.client.on('close', () => this.emit('close'));
        this.client.on('message', (topic, message) => {
            this.emit('message', topic, message);
        });
    }
}