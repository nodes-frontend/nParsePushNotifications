(function() {
	"use strict";

	angular
		.module('nParsePushNotifications')
		.factory('nParsePushNotifications', nParsePushNotifications);

	/* @ngInject */
	function nParsePushNotifications($ionicPlatform, $http, $q, $window, $rootScope, nParsePushNotificationsConfig) {

		/**
		 * Public API
		 * @type object
		 */
		var service = {
			init							: init,
			unregister						: unregister,
			hasPermission					: hasPermission,
			setApplicationBadgeNumberIOS	: setApplicationBadgeNumberIOS,
			subscribe						: subscribe,
			unsubscribe						: unsubscribe,
			unsubscribeAll					: unsubscribeAll
		};

		/**
		 * Instance of PushNotifications
		 * Isset then PushNotifications has been initialized
		 * @type object
		 */
		var instance = undefined;

		/**
		 * Configuration for PushNotifications
		 * And Parse.com
		 * @type object
		 */
		var config = nParsePushNotificationsConfig;

		return service;

		/**
		 * Initialze PushNotification - https://github.com/phonegap/phonegap-plugin-push
		 * And uploads installation data to Parse.com
		 * @returns Returns a promise
		 */
		function init() {
			var deferred = $q.defer();

			/**
			 * Sets instance to the promise until PushNotification is initialized
			 * so it can be referenced by other functions like subscribe
			 * @type a promise
			 */
			$ionicPlatform.ready(function deviceReady() {

				if($window.PushNotification) {

					var PushNotification = window.PushNotification.init(config);

					PushNotification.on('registration', function registration(data) {
						config.parse.deviceToken = data.registrationId;

						_uploadParseInstallation().then(function uploadedParseInstallationSuccess() {
							deferred.resolve(PushNotification);
						}).catch(function uploadedParseInstallationCatch(response) {
							deferred.reject(response);
						});
					});

					PushNotification.on('notification', function notification(data) {
						$rootScope.$emit('$cordovaPush:notificationReceived', data);

						/**
						 * Tells the OS that you are done processing a background push notification.
						 */
						setTimeout(function() {
							PushNotification.finish();
						}, 30000);
					});
					PushNotification.on('error', function notificationError(error) {
						$rootScope.$emit('$cordovaPush:errorOccurred', error);
					});

				} else {
					deferred.reject('Oops! Something went wrong: phonegap-plugin-push was not found!');
				}
			});

			instance = deferred.promise;
			return deferred.promise;
		}

		/**
		 * Uploads installation data to Parse.com
		 * @returns a promise
		 * @private
		 */
		function _uploadParseInstallation() {
			var deferred = $q.defer(),
				parse    = config.parse,
				reqData  = {
					deviceType	: parse.deviceType,
					deviceToken : parse.deviceToken,
					pushType	: parse.pushType,
					GCMSenderId : parse.GCMSenderId
				};

			$http.post(config.parse.endpoint, reqData, {
				"headers": {
					"Content-Type"				: "application/json",
					"X-Parse-Application-Id"	: parse.appID,
					"X-Parse-REST-API-Key"		: parse.key
				}
			}).success(function uploadParseInstallationSuccess(response) {

				if( response.hasOwnProperty('channels') ) {
					parse.channels = response.channels;
				}
				parse.objectID = response.objectId;

				deferred.resolve(response);

			}).error(function uploadParseInstallationCatch(response, status) {
				deferred.reject('Oops! Something went wrong', response, status);
			});

			return deferred.promise;
		}

		/**
		 * Updates installation data at Parse.com
		 * @returns a promise
		 * @private
		 */
		function _updateParseInstallation() {
			var deferred = $q.defer(),
				parse    = config.parse,
				reqData  = {
					channels	: parse.channels,
					deviceType	: parse.deviceType,
					deviceToken : parse.deviceToken,
					pushType	: parse.pushType,
					GCMSenderId : parse.GCMSenderId
				};

			instance.then(function instanceSuccess() {

				$http.put(parse.endpoint + '/' + parse.objectID, reqData, {
						"headers": {
							"Content-Type"				: "application/json",
							"X-Parse-Application-Id"	: parse.appID,
							"X-Parse-REST-API-Key"		: parse.key
						}
					})
					.success(function updateParseInstallationSuccess(response) {
						if( response.hasOwnProperty('channels') ) {
							parse.channels = response.channels;
						}
						deferred.resolve(response);
					})
					.error(function updateParseInstallationCatch(response, status) {
						deferred.reject('Oops! Something went wrong', response, status);
					});

			}).catch(function instanceCatch(error) {
				deferred.reject(error);
			});

			return deferred.promise;
		}

		/**
		 * Checks if item is in array
		 * @param array
		 * @param item
		 * @returns {boolean}
		 * @private
		 */
		function _inArray(array, item) {
			return array.indexOf(item) >= 0;
		}

		/**
		 * Unregister PushNotification - https://github.com/phonegap/phonegap-plugin-push
		 * Beware that this cleans up all event handlers, so you will need to re-init service to get
		 * Pushes working again without reloading the application.
		 * @returns a promise
		 */
		function unregister() {
			var deferred = $q.defer();

			instance.then(function instanceSuccess(PushNotification) {
				PushNotification.unregister(function unregisterSuccess() {
					deferred.resolve(true);
				}, function unregisterCatch() {
					deferred.reject('Oops! Something went wrong');
				});
			});

			deferred.resolve(true);

			return deferred.promise;
		}

		/**
		 * Checks whether the push notification permission has been granted.
		 * @returns a promise
		 */
		function hasPermission() {
			var deferred = $q.defer();

			$ionicPlatform.ready(function hasPermissionDeviceReady() {
				if($window.PushNotification) {

					$window.PushNotification.hasPermission(function getPermission(data) {
						deferred.resolve(data.isEnabled);
					});
				} else {
					deferred.reject('Oops! Something went wrong: phonegap-plugin-push was not found!');
				}
			});

			return deferred.promise;
		}

		/**
		 * Set the badge count visible when the app is not running.
		 * @param count
		 */
		function setApplicationBadgeNumberIOS(count) {
			instance.setApplicationIconBadgeNumber(function setApplicationBadgeNumberSuccess() {
				return count;
			}, function setApplicationBadgeNumberCatch() {
				return 'Oops! Something went wrong';
			}, count);
		}

		/**
		 * Subscribes to specified channel by updating channels at Parse.com
		 * @param channel
		 * @returns a promise
		 */
		function subscribe(channel) {
			var deferred = $q.defer(),
				parse    = config.parse;

			instance.then(function instanceSuccess() {

				if( !_inArray(parse.channels, channel) ) {

					parse.channels[parse.channels.length] = channel;

					_updateParseInstallation().then(function updateParseInstallationSuccess() {
						deferred.resolve(parse.channels);
					}).catch(function updateParseInstallationCatch(error) {
						deferred.reject(error);
					});
				} else {
					deferred.resolve('Specified channel is already subcribed');
				}

			}).catch(function instanceCatch(error) {
				deferred.reject(error);
			});

			return deferred.promise;
		}

		/**
		 * Unsubscribes specified channel by updating channels at Parse.com
		 * @param channel
		 * @returns a promise
		 */
		function unsubscribe(channel) {
			var deferred = $q.defer(),
				parse 	 = config.parse;

			instance.then(function instanceSuccess() {

				var index = parse.channels.indexOf(channel);
				if(index >= 0) {

					parse.channels.splice(index, 1);

					_updateParseInstallation().then(function updateParseInstallationSuccess() {
						deferred.resolve(parse.channels);
					}).catch(function updateParseInstallationCatch(error) {
						deferred.reject(error);
					});
				} else {
					deferred.reject('Oops! Something went wrong: Channel does not seem to be subscribed');
				}

			}).catch(function instanceCatch(error) {
				deferred.reject(error);
			});

			return deferred.promise;
		}

		/**
		 * Unsubscribes all channels at Parse.com
		 * Beware that the broadcast will still be subscribed
		 * To totally disable push notifications use the unregister method
		 * @returns a promise
		 */
		function unsubscribeAll() {
			var deferred = $q.defer(),
				parse 	 = config.parse;

			instance.then(function instanceSuccess() {

				parse.channels = [];

				_updateParseInstallation().then(function updateParseInstallationSuccess() {
					deferred.resolve(parse.channels);
				}).catch(function updateParseInstallationCatch(error) {
					deferred.reject(error);
				});

			}).catch(function instanceCatch(error) {
				deferred.reject(error);
			});

			return deferred.promise;
		}
	}
})();