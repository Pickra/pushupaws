# pushupaws

Leverage AWS IoT to easily publish and receive serverless notifications in the browser.

__Note: This package is currently in an alpha state.__

With this package, all you need is an AWS Cognito identity pool ID and AWS IoT endpoint to allow a browser client to
subscribe to serverless push notifications for your application.

Functionality is currently limited to unauthenticated users via an AWS Cognito identity pool.  What this means is that
anyone who has your identity pool ID can subscribe to topics on your IOT endpoint.  It is highly recommended that you
not use this for a publicly accessible site, as this may result in unexpected AWS charges to your account.  Additionally,
if you fail to properly limit access provided by the identity pool ID, your AWS account may become compromised.

Functionality to provide authenticated user access will follow in the next few weeks.

## Installation

```$xslt
npm install pushupaws
```

or

```$xslt
yarn add pushupaws
```

I highly recommend using a module bundler such as [webpack](https://webpack.js.org/) or
[browserify](http://browserify.org/) to include the package in your app, but there are, of course,
many ways to do so.  Should there appear to actually be any interest in this tool, I'll put it up
on a CDN.

## Usage

Connect to an AWS IoT endpoint:

```javascript
const identityPoolId = 'some-identity-pool-id'; // Be discrete; make sure the people who can get this are people you trust.
const endpoint = 'some-endpoint-url';
const region = 'some-region-string';
const clientId = 'some-unique-client-id';

const pushupaws = new Pushupaws(region, endpoint, identityPoolId, clientId);
```

Add some listeners:

```javascript
pushupaws.onConnect(() => { /* connection listener */ });
pushupaws.onError(() => { /* error listener */ });
pushupaws.subscribe('topic-name', () => { /* message listener for topic */ });
```

And that's it!  Note that although a single instance of pushupaws can handle multiple topics, a separate
instance is required for distinct IoT endpoints.