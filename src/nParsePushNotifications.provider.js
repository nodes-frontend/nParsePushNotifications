(function() {
	"use strict";

	angular
		.module('nParsePushNotifications')
		.provider('nParsePushNotificationsConfig', nParsePushNotificationsConfig);

	/* @ngInject */
	function nParsePushNotificationsConfig() {

		/**
		 * Get the current Platform to determine if Android or iOS
		 */
		var PLATFORM = _getPlatform();

		function _getPlatform() {
			if( ionic.Platform.isWebView() && ionic.Platform.isIOS() ) {
				return 'ios';
			} else if( ionic.Platform.isWebView() && ionic.Platform.isAndroid() ) {
				return 'android';
			}
		}

		var defaults = {
			/**
			 * Details about PushNotification options can be found here:
			 * https://github.com/phonegap/phonegap-plugin-push/blob/master/docs/API.md#pushnotificationinitoptions
			 */
			android: {
				senderID			: undefined,
				icon				: undefined,
				iconColor			: undefined,
				sound				: true,
				vibrate				: true,
				clearNotifications	: true,
				forceShow			: false,
				topics				: []
			},
			ios: {
				alert				: false,
				badge				: false,
				sound				: false,
				clearBadge			: false,
				senderID			: undefined,
				gcmSandbox			: false,
				topics				: []
			},
			parse: {
				/**
				 * Root endpoint for installations at Parse.com
				 */
				endpoint			: 'https://api.parse.com/1/installations',
				/**
				 * registrationId from PushNotifications
				 */
				objectID			: undefined,
				/**
				 * App ID for Parse.com
				 */
				appID				: undefined,
				/**
				 * REST-API-KEY for Parse.com
				 */
				key					: undefined,
				deviceType			: PLATFORM,
				pushType 			: PLATFORM === 'android' ? 'gcm' : undefined,
				GCMSenderId         : undefined,
				/**
				 * Device token from Parse.com
				 */
				deviceToken			: undefined,
				/**
				 * Channels for Parse.com
				 */
				channels			: []
			}
		};

		this.configure = function(config) {

			for(var key in defaults) {
				if( config.hasOwnProperty(key) ) {
					angular.extend(defaults[key], config[key]);
					if( config[key].hasOwnProperty('senderID') ) {
						defaults.parse.GCMSenderId = config[key].senderID;
					}
				}
			}
		};

		this.$get = [function() {
			return defaults;
		}];
	}
})();