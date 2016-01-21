# nParsePushNotifications
Angular wrapper for phonegap/phonegap-plugin-push using Parse.com Pushes which $emits notifications like ng-cordova push plugin.

## Configuration
Configuration can be done by the provider example:

```javascript
nParsePushNotificationsConfigProvider.configure({
		android: {
			senderID: "SENDER-ID"
		},
		ios: {
			alert: "true",
			badge: "true",
			sound: "true"
		},
		parse: {
			appID: 'PARSE-APP-ID',
			key: 'PARSE-REST-KEY'
		}
	});
```
You can see the full list of configureable options here:
https://github.com/phonegap/phonegap-plugin-push/blob/master/docs/API.md#pushnotificationinitoptions

## Init
```javascript
nParsePushNotifications.init().then(function() {
    // Do something
});
```

## Subscribe channel
```javascript
nParsePushNotifications.init().then(function() {
    nParsePushNotifications.subscribe('CHANNEL');
});
```

## Unsubscribe channel
```javascript
nParsePushNotifications.init().then(function() {
    nParsePushNotifications.unsubscibe('CHANNEL');
});
```

## Unregister pushes
```javascript
nParsePushNotifications.unregister().then(function() {
    // Do Something
});
```
## Has permission?
```javascript
nParsePushNotifications.hasPermission().then(function(hasPermission) {
    // Do Something
});
```

## Listen for notifications
```javascript
$rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
    alert( 'PUSH!!' + JSON.stringify(notification) );
});

$rootScope.$on('$cordovaPush:errorOccurred', function(event, error) {
    alert( 'PUSH ERROR!!' + JSON.stringify(error) );
});
```

