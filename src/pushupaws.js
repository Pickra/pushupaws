// @flow

import authorize from './authorize';
import IoTConnection from './iot-connection';

import type { SubscriberListener } from './iot-connection';

class AwsServerlessPush {
    ioTConnection: IoTConnection;

    subscriptions = [];

    constructor(region: string, endpoint: string, identityPoolId: string, clientId: string) {
        this.ioTConnection = new IoTConnection(region, endpoint, clientId);
        authorize(identityPoolId).then(credentials => {
            this.ioTConnection.connect(credentials);
            this.onConnect(this.subscribeOnConnect);
        }).catch(err => {
            this.ioTConnection.emit('error', err);
        });
    }

    isConnected() {
        return this.ioTConnection.status === IoTConnection.connectionStates[1];
    }

    onConnect(listener: () => void) {
        this.ioTConnection.on('connect', listener);
        if (this.isConnected()) { listener(); }
    }

    onError(listener: (Error) => void) {
        this.ioTConnection.on('error', listener);
        if (this.ioTConnection.status === 'CONNECTION ERROR') { listener(this.ioTConnection.error); }
    }

    publish(topic: string, message: any) {
        if (!this.isConnected()) { throw new Error('Messages cannot be published if client is not connected'); }
        this.ioTConnection.client.publish(topic, message);
    }

    subscribe(topic: string, listener: SubscriberListener) {
        if (!this.isConnected()) {
            this.subscriptions.push({ topic, listener });
        } else {
            this.subscribeAfterConnect(topic, listener);
        }
    }

    /**
     * @private
     * Returns a listener function which is specific to the specified topic.
     *
     * @param topic
     * @param listener
     * @returns {function(*, *=)}
     */
    getSubscriber(topic: string, listener: SubscriberListener) {
        return (messageTopic: string, message: any) => {
            if (topic === messageTopic) { listener(topic, message); }
        };
    }

    /**
     * @private
     * Used to subscribe to topics and add listeners once the connection is available.
     * @param topic
     * @param listener
     */
    subscribeAfterConnect(topic: string, listener: SubscriberListener) {
        this.ioTConnection.client.subscribe(topic);
        this.ioTConnection.on('message', this.getSubscriber(topic, listener));
    }

    subscribeOnConnect = () => {
        this.subscriptions.forEach(subscription => {
            this.subscribeAfterConnect(subscription.topic, subscription.listener);
        });
        this.subscriptions = [];
    }
}

module.exports = AwsServerlessPush;