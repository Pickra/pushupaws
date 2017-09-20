import EventEmitter from 'events';

import chai from 'chai';
chai.should();
import sinon from 'sinon';

import Pushupaws from '../src/pushupaws';

describe('PushupAWS', () => {
    let authorizeStub;
    let awsIoTMock;
    let mockRegion;
    let mockEndpoint;
    let mockIdentityPoolId;
    let mockCredentials;
    let mockClientId;
    let mockClient;
    let pushupaws;

    beforeEach(() => {
        authorizeStub = sinon.stub();
        Pushupaws.__Rewire__('authorize', authorizeStub);
        awsIoTMock = sinon.mock(Pushupaws.__get__('IoTConnection').__get__('awsIoT'));

        mockRegion = 'region';
        mockEndpoint = 'endpoint';
        mockIdentityPoolId = 'identity-pool';
        mockCredentials = {
            expired: false,
            accessKeyId: 'access-key-id',
            secretAccessKey: 'secret-access-key',
            sessionToken: 'session-token'
        };
        mockClientId = 'client-id';
        mockClient = new EventEmitter();
        mockClient.subscribe = sinon.spy();
    });

    afterEach(() => {
        awsIoTMock.restore();
    });

    function initialize() {
        authorizeStub.resolves(mockCredentials);
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
        pushupaws = new Pushupaws(mockRegion, mockEndpoint, mockIdentityPoolId, mockClientId);
        // Need to wait a tick before emitting any events to ensure that authorization promise resolves.
        return Promise.resolve();
    }

    it('should authorize and connect to the specified IoT endpoint', () => {
        initialize().then(() => {
            mockClient.emit('connect');
            pushupaws.isConnected().should.equal(true);
            awsIoTMock.verify();
        });
    });

    it('should call an error listener if authorization fails', () => {
        authorizeStub.rejects(new Error('unable'));
        pushupaws = new Pushupaws(mockRegion, mockEndpoint, mockIdentityPoolId, mockClientId);
        pushupaws.onError(err => {
            pushupaws.isConnected().should.equal(false);
            err.message.should.equal('unable');
        });
    });

    it('should call an error listener if connection fails', () => {
        const promise = initialize();
        pushupaws.onError(err => {
            err.should.equal('error');
            pushupaws.isConnected().should.equal(false);
            awsIoTMock.verify();
        });
        return promise.then(() => mockClient.emit('error', 'error'));
    });

    describe('onConnect', () => {
        let listener;

        beforeEach(() => {
            listener = sinon.spy();
            return initialize().then(() => awsIoTMock.verify());
        });

        it('should call the connect listener once the client is connected', () => {
            pushupaws.onConnect(listener);
            listener.called.should.equal(false);
            mockClient.emit('connect');
            listener.called.should.equal(true);
        });

        it('should call the connect listener immediately if listener is added after connection completes', () => {
            mockClient.emit('connect');
            pushupaws.onConnect(listener);
            listener.called.should.equal(true);
        });
    });

    describe('onError', () => {
        let listener;

        beforeEach(() => {
            listener = sinon.spy();
            return initialize().then(() => awsIoTMock.verify());
        });

        it('should call the error listener when the client emits an error', () => {
            pushupaws.onError(listener);
            listener.called.should.equal(false);
            mockClient.emit('error');
            listener.called.should.equal(true);
        });

        it('should call the error listener immediately if listener is added when there is an error state', () => {
            mockClient.emit('error', 'error');
            pushupaws.onError(listener);
            listener.calledWith('error').should.equal(true);
        });
    });

    describe('subscribe', () => {
        let listener;

        beforeEach(() => {
            listener = sinon.spy().withArgs('message');
            return initialize().then(() => awsIoTMock.verify());
        });

        it('should add a message listener to the ioTConnection instance for the specified topic', () => {
            mockClient.emit('connect');
            pushupaws.subscribe('topic', listener);
            mockClient.subscribe.calledWith('topic').should.equal(true);
            mockClient.emit('message', 'topic', 'message');
            listener.called.should.equal(true);
        });

        it('should wait to subscribe and add the listener if the connection is not yet ready', () => {
            pushupaws.subscribe('topic', listener);
            mockClient.subscribe.notCalled.should.equal(true);
            mockClient.emit('connect');
            mockClient.subscribe.calledWith('topic').should.equal(true);
            mockClient.emit('message', 'topic', 'message');
            listener.called.should.equal(true);
        });
    });

    describe('isConnected', () => {
        beforeEach(() => {
            return initialize().then(() => awsIoTMock.verify());
        });

        it('should return true if the client is connected', () => {
            mockClient.emit('connect');
            pushupaws.isConnected().should.equal(true);
        });

        it('should return false if the client is not connected', () => {
            mockClient.status = 'NOT CONNECTED';
            pushupaws.isConnected().should.equal(false);
        });
    });
});
