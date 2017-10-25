import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.should();
chai.use(chaiAsPromised);
import sinon from 'sinon';

import authorize from '../src/authorize';

describe('authorize', () => {
    let AWS;
    let getStub;

    beforeEach(() => {
        AWS = authorize.__get__('AWS');

        getStub = sinon.stub();
        AWS.CognitoIdentityCredentials = sinon.stub();
    });

    it('should return a promise which resolves to a set of credentials', () => {
        AWS.CognitoIdentityCredentials.callsFake(function () {
            this.get = getStub;
            this.accessKeyId = 'access-key-id';
        });
        const credentialsPromise = authorize('identity-pool');
        getStub.args[0][0]();
        return credentialsPromise.should.eventually.be.fulfilled.then(value => {
            value.accessKeyId.should.equal('access-key-id');
            AWS.CognitoIdentityCredentials.calledWith({ IdentityPoolId: 'identity-pool' }).should.equal(true);
        });
    });

    it('should return a rejected promise if credentials cannot be obtained', () => {
        AWS.CognitoIdentityCredentials.callsFake(function () {
            this.expired = true;
            this.get = getStub;
        });
        const credentialsPromise = authorize('identity-pool');
        getStub.args[0][0]();
        return credentialsPromise.should.be.rejectedWith('Unable to obtain valid Cognito credentials.');
    });

    it('should not attempt to obtain new credentials if valid cognito credentials exist', () => {
        AWS.config.credentials = {
            expired: false,
            cognito: true,
            accessKeyId: 'access-key-id'
        };
        return authorize('identity-pool').should.eventually.be.fulfilled.then(value => {
            value.accessKeyId.should.equal('access-key-id');
            AWS.CognitoIdentityCredentials.called.should.equal(false);
        });
    });
});