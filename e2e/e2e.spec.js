describe('pushupaws', function () {
    var region;
    var endpoint;
    var identityPoolId;
    var sender;
    var receiver;


    before(function () {
        region = 'us-west-2';
        endpoint = ENDPOINT; //eslint-disable-line no-undef
        identityPoolId = IDENTITY_POOL_ID; //eslint-disable-line no-undef
        sender = new Pushupaws(region, endpoint, identityPoolId, Math.random().toString()); // eslint-disable-line no-undef

        return new Promise(function (resolve, reject) {
            sender.onConnect(function () {
                receiver = new Pushupaws(region, endpoint, identityPoolId, Math.random().toString()); // eslint-disable-line no-undef
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
        console.log('it should be notified...');
        var promise = new Promise(function (resolve) {
            console.log('adding subscription...');
            receiver.subscribe('test-topic', function (topic, message) {
                console.log('message received:', message);
                message.toString('utf-8').should.equal('test message');
                resolve();
            });
        });
        console.log('publishing...');
        sender.publish('test-topic', 'test message');
        console.log('published.');
        return promise;
    });
});
