describe('pushupaws', function () {
    var region;
    var endpoint;
    var identityPoolId;
    var sender;
    var receiver;


    before(function () {
        region = 'us-west-2';
        endpoint = 'a2gw5j32h94okz.iot.us-west-2.amazonaws.com';
        identityPoolId = 'us-west-2:9f1c7ee2-aca2-48d0-a904-6f29cebe560c';
        sender = new Pushupaws(region, endpoint, identityPoolId, Math.random().toString()); // eslint-disable-line no-undef
        receiver = new Pushupaws(region, endpoint, identityPoolId, Math.random().toString()); // eslint-disable-line no-undef

        return new Promise(function (resolve, reject) {
            sender.onConnect(function () {
                receiver.onConnect(function () {
                    resolve();
                });
                receiver.onError(function (err) {
                    reject(err);
                });
            });
            sender.onError(function (err) {
                reject(err);
            });
        });
    });

    it('should be connected to the IoT endpoint', function () {
        sender.isConnected().should.equal(true);
        receiver.isConnected().should.equal(true);
    });

    it('should be notified of a message when the message is published', function () {
        var promise = new Promise(function (resolve) {
            sender.subscribe('test-topic', function (topic, message) {
                message.toString('utf-8').should.equal('test message');
                resolve();

            });
        });
        sender.publish('test-topic', 'test message');
        return promise;
    });
});