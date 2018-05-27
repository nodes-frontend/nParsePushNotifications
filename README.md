# ⛔️ [DEPRECATED] nParsePushNotifications
---
Angular wrapper for push notifications with [phonegap/phonegap-plugin-push](https://github.com/phonegap/phonegap-plugin-push) using Parse.com

## Configuration

Configuration can be done by the provider inside your Angular module config. You can see the full list of configureable options [here](https://github.com/phonegap/phonegap-plugin-push/blob/master/docs/API.md#pushnotificationinitoptions)

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

## Init
```javascript
nParsePushNotifications.init().then(function() {
    // Do something
});
```

## Subscribe channel
```javascript
nParsePushNotifications.subscribe('CHANNEL').then(function(channels) {
    // Do something
});
```

## Unsubscribe channel
```javascript
nParsePushNotifications.unsubscibe('CHANNEL').then(function(channels) {
    // Do something
});
```

## Unsubscribe all channels
Beware that this doesn't unsubscribe the broadcast channel. If you wanna disable push notifications entirely, you should you the unregister method.
```javascript
nParsePushNotifications.unsubcribeAll().then(function(channels) {
    // Do something
});
```

## Unregister push notifications
```javascript
nParsePushNotifications.unregister().then(function() {
    // Do Something
});
```
## Has permission?
```javascript
nParsePushNotifications.hasPermission().then(function(hasPermission) {
    if(hasPermission) {
        // Perfect
    } else {
        // Do something
    }
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

