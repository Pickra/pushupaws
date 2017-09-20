import EventEmitter from 'events';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.should();
chai.use(chaiAsPromised);
import sinon from 'sinon';
import IoTConnection from '../src/iot-connection';

describe('iot-connection', () => {
    let awsIoTMock;
    let region;
    let endpoint;
    let clientId;
    let mockCredentials;
    let mockClient;
    let iotConnection;

    beforeEach(() => {
        awsIoTMock = sinon.mock(IoTConnection.__get__('awsIoT'));
        region = 'region';
        endpoint = 'endpoint';
        clientId = 'client-id';
        mockCredentials = {
            accessKeyId: 'access-key-id',
            secretAccessKey: 'secret-access-key',
            sessionToken: 'session-token'
        };
        mockClient = new EventEmitter();
        iotConnection = new IoTConnection(region, endpoint, clientId);
    });

    it('should prepare a new IoT connection manager', () => {
        iotConnection.should.be.instanceOf(IoTConnection);
        iotConnection.status.should.equal('NOT CONNECTED');
    });

    describe('connect', () => {
        beforeEach(() => {
            awsIoTMock.expects('device')
                .withExactArgs({
                    host: 'endpoint',
                    port: 443,
                    region: 'region',
                    clientId: 'client-id',
                    accessKeyId: 'access-key-id',
                    secretKey: 'secret-access-key',
                    sessionToken: 'session-token',
                    protocol: 'wss'
                }).returns(mockClient);
            iotConnection.connect(mockCredentials);
        });

        afterEach(() => {
            awsIoTMock.restore();
        });

        it('should create a device connection to AWS IoT', () => {
            iotConnection.client.should.be.an.instanceof(EventEmitter);
            awsIoTMock.verify();
        });

        it('should configure handlers for client connection events', () => {
            awsIoTMock.verify();

            mockClient.emit('connect');
            iotConnection.status.should.equal('CONNECTED');

            mockClient.emit('error', 'error');
            iotConnection.status.should.equal('CONNECTION ERROR');
            iotConnection.error.should.equal('error');

            mockClient.emit('close');
            iotConnection.status.should.equal('NOT CONNECTED');
        });

        it('should configure client message event', () => {
            awsIoTMock.verify();
            let actualTopic = '';
            let actualMessage = '';
            iotConnection.on('message', (topic, message) => {
                actualTopic = topic;
                actualMessage = message;
            });
            mockClient.emit('message', 'topic', 'message');
            actualTopic.should.equal('topic');
            actualMessage.should.equal('message');
        });
    });
});