var sessionStorageKeys = {
	skeleton : 'skeleton_data'
};

var app = angular.module('findMyFood', ['ui.router', 'filters']);

app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/dashboard/');
    $stateProvider.state('dashboard', {
		url: '/dashboard/',
		views: {
		  'mainContent': {
		    templateUrl: 'views/dashboard.html',
		    controller: 'dashboard'
		  },
		  'mainMenu': {
		    templateUrl: 'views/menu.html',
		    controller: 'menu'
		  }
		}
	}).state('findIt', {
		url: '/findIt/',
		views: {
		  'mainContent': {
		    templateUrl: 'views/findIt.html',
		    controller: 'findIt'
		  },
		  'mainMenu': {
		    templateUrl: 'views/menu.html',
		    controller: 'menu'
		  }
		}
	}).state('configure', {
		url: '/configure/',
		views: {
		  'mainContent': {
		    templateUrl: 'views/configure.html',
		    controller: 'configure'
		  },
		  'mainMenu': {
		    templateUrl: 'views/menu.html',
		    controller: 'menu'
		  }
		}
	}).state('history', {
		url: '/history/',
		views: {
		  'mainContent': {
		    templateUrl: 'views/history.html',
		    controller: 'history'
		  },
		  'mainMenu': {
		    templateUrl: 'views/menu.html',
		    controller: 'menu'
		  }
		}
	}).state('aboutIt', {
		url: '/aboutIt/',
		views: {
		  'mainContent': {
		    templateUrl: 'views/aboutIt.html',
		    controller: 'aboutIt'
		  },
		  'mainMenu': {
		    templateUrl: 'views/menu.html',
		    controller: 'menu'
		  }
		}
	});
});

app.controller('dashboard', function($scope, skeletonFactory) {
	$scope.dashboardItems = {
		loading : true
	};

	var init = function() {
		var storedData;

		storedData = skeletonFactory.getStoredSkeleton();
		if(storedData === null) {
			skeletonFactory.getSkeleton().then(function(d){
				$scope.dashboardItems.dashboard = d.dashboard;
				$scope.dashboardItems.loading = false;
			});
		} else {
			$scope.dashboardItems.dashboard = storedData.dashboard;
			$scope.dashboardItems.loading = false;
		}
		
	};

	init();
});

app.controller('menu', function($rootScope, $urlRouter, $scope, $location, $window, skeletonFactory) {
	$scope.navigation = {
		path : $location.path(),
		loading : true
	};

	var init = function() {
		var storedData;

		storedData = skeletonFactory.getStoredSkeleton();
		if(storedData === null) {
			skeletonFactory.getSkeleton().then(function(d){
				$scope.navigation.menu = d.menu;
				$scope.navigation.loading = false;
			});
		} else {
			$scope.navigation.menu = storedData.menu;
			$scope.navigation.loading = false;
		}
	};

	var listeners = function () {
		$rootScope.menuInitialized = true;
		angular.element($window.document.getElementById('hamburguerMenu')).on('click', function(event) {
			event.preventDefault();
			var body = $window.document.getElementsByTagName('body');
			if (angular.element(body).hasClass('activeMenu')) {
				angular.element(body).removeClass('activeMenu');
			} else {
				angular.element(body).addClass('activeMenu');
			}
		});
		$rootScope.$on('$locationChangeSuccess', function(evt) {
			angular.element($window.document.getElementsByTagName('body')).removeClass('activeMenu');
		});
	};

	if (!$rootScope.menuInitialized) {
		listeners();
	}

	init();

});

app.controller('findIt', function($scope, $timeout, $window, trackPosition, googleMaps) {
	$scope.findIt = {
		position : false,
		map : false,
		showMap : true,
		showOverlay : true,
		showPlaces : false,
		showOverlayLoading : true,
		configuration : [ 'cafe', 'restaurant' ],
		markers : [],
		places : [],
		screenHeight : 0
	};

	var randomTimes = 0;

	var init = function() {
		adjustHeight($window.document.querySelectorAll('.makeItFit'));
		angular.element($window).bind('resize', function() {
			adjustHeight($window.document.querySelectorAll('.makeItFit'));
		});
		trackPosition.getCoords().then(function(d) {
			$scope.findIt.position = new google.maps.LatLng(d[0], d[1]);
			if ($scope.findIt.map === false) {
				$scope.findIt.map = new google.maps.Map($window.document.getElementById('maps'), {
			    	center: $scope.findIt.position,
			    	zoom: 13
			    });
			    google.maps.event.addDomListener($window, "resize", function() {
					resizeMap();
				});
				$scope.$watch('findIt.showPlaces', function() {
					adjustHeight($window.document.querySelectorAll('.makeItFit'));
					resizeMap();
				});
			} else {
				$scope.findIt.map.setCenter($scope.findIt.position);
				$scope.findIt.map.setZoom(13);
				removeAllMarkers();
			}
			addYouMarker();
			resizeMap();
			getPlaces();
		});
	};

	var getPlaces = function () {
		googleMaps.getPlaces($scope.findIt.map, $scope.findIt.position, 10 * 1609.34, $scope.findIt.configuration, 2).then(function(d){
			if ($scope.findIt.places.error) {
				removeAllMarkers();
				addYouMarker();
			} else {
				randomizeMainList(d, 6);
			}
		});
	};

	var getRandomInt = function (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	var randomizeMainList = function (list, maxItems) {
		var i, j, currentNumber, there, iterator,
			selectedList = [];
		if (maxItems > list.length) {
			maxItems = list.length;
		}
		iterator = maxItems;
		for (i = 0; i < iterator; i++) {
			there = false;
			currentNumber = getRandomInt(0, list.length);
			for (j = 0; j < selectedList.length; j++) {
				if (currentNumber === selectedList[j]) {
					there = true;
				}
			}
			if (i === 0 || there === false) {
				selectedList.push(currentNumber);
			} else {
				iterator++;
			}
		}
		for (i = 0; i < selectedList.length; i++) {
			$scope.findIt.places.push(list[selectedList[i]]);
		}
		addMarkers();
		$scope.findIt.showPlaces = true;
		$scope.findIt.showOverlay = false;
		$scope.findIt.showOverlayLoading = false;
		selectionAnimation(maxItems, false, getRandomInt(7, 14));
	};

	var selectionAnimation = function (maxItems, lastItem, iteractions) {
		var i, 
			randomPosition = getRandomInt(0, maxItems-1);
			el = $window.document.getElementById('placeSelectorWrapper');
			el2 = el.querySelectorAll('.place');
		if (randomPosition === lastItem) {
			if (randomPosition === 0) {
				randomPosition++;
			} else {
				randomPosition--;
			}
		}
		angular.element(el2).removeClass('active');
		angular.element(el2[randomPosition]).addClass('active');
		randomTimes++;
		if (randomTimes <= iteractions) {
			$timeout(function () {
				selectionAnimation(maxItems, randomPosition, iteractions);
			}, getRandomInt(300, 700));
		} else {
			randomTimes = 0;
			showFinalResult(randomPosition);
		}
	};

	var showFinalResult = function (result) {
		centerOnMap(result+1);
	};

	var centerOnMap = function (id) {
		if (typeof id === "number") {
			if (id <= $scope.findIt.markers.length){
				$scope.findIt.map.setCenter(
					$scope.findIt.markers[id].position
				);
				//$scope.findIt.map.setZoom(16);
			}
		}
	};

	var addYouMarker = function () {
		var marker = new google.maps.Marker({
		    position: $scope.findIt.map.getCenter(),
		    map: $scope.findIt.map,
		    title: 'You'
		});
		$scope.findIt.markers.push(marker);
	};

	var addMarkers = function () {
		var i, marker;
		for (i = 0; i < $scope.findIt.places.length; i++) {
			marker = new google.maps.Marker({
				map: $scope.findIt.map,
				animation: google.maps.Animation.DROP,
				position: $scope.findIt.places[i].geometry.location,
				title: $scope.findIt.places[i].name
			});
			// var markerClickEvent = google.maps.event.addListener(marker, 'click', function(id, index) {
			// 	return function() {$scope.showDetails(index, id);$scope.$digest();}
			// }($scope.places[i].place_id, i+1));
			$scope.findIt.markers.push(marker);
			//$scope.markersListeners.push(markerClickEvent);
		}
	};

	var removeAllMarkers = function () {
		for (var i = 0; i < $scope.findIt.markers.length; i++) {
			$scope.findIt.markers[i].setMap(null);
		}
		$scope.findIt.markers = [];
		// for (var i = 0; i < $scope.markersListeners.length; i++) {
		// 	google.maps.event.removeListener($scope.markersListeners[i]);
		// }
		// $scope.markersListeners = [];
	};

	var resizeMap = function () {
		var center = $scope.findIt.map.getCenter();
		google.maps.event.trigger($scope.findIt.map, 'resize');
		$scope.findIt.map.setCenter(center);
	};

	var adjustHeight = function(elements) {
		var windowHeight = $window.innerHeight || $window.document.documentElement.clientHeight || $window.document.getElementsByTagName('body')[0].clientHeight,
			windowWidth = $window.innerWidth || $window.document.documentElement.clientWidth || $window.document.getElementsByTagName('body')[0].clientWidth,
			heightSize;

		if (windowWidth >= 768 || $scope.findIt.showPlaces === false) {
			heightSize = windowHeight - 48 - 38;
		} else {
			heightSize = (windowHeight - 48 - 38)/2;
		}
		
		for (var i = 0; i < elements.length; i++) {
			angular.element(elements[i]).css('height', heightSize + 'px');
		}
	};


	init();


});

app.factory('skeletonFactory', function($http, $window) {

	var factory = {};

	factory.getStoredSkeleton = function() {
		if ($window.Modernizr.sessionstorage) {
			return $window.JSON.parse($window.sessionStorage.getItem($window.sessionStorageKeys.skeleton));
		}
	};

	factory.getSkeleton = function() {
		var promise = $http.get('json/skeleton.json').then(function (results) {
			if ($window.Modernizr.sessionstorage) {
				$window.sessionStorage.setItem($window.sessionStorageKeys.skeleton, $window.JSON.stringify(results.data));
			}
			return results.data;
		});
		return promise;
	};

	return factory;
});

app.factory('trackPosition', ['$q', '$window', '$rootScope', function ($q, $window, $rootScope) {

	var factory = {};

	factory.getCoords = function() {
		var deferred = $q.defer();
		if (Modernizr.geolocation) {
            $window.navigator.geolocation.getCurrentPosition(function (position) {
                $rootScope.$apply(function() {
                    deferred.resolve([position.coords.latitude, position.coords.longitude]);
                });
            }, function (error) {
                $rootScope.$apply(function() {
                    deferred.reject(error);
                });
            });
		} else {
            $rootScope.$apply(function() {
                deferred.reject(new Error("Geolocation is not supported"));
            });
		}
		return deferred.promise;
	};

	return factory;

}]);

app.factory('googleMaps', ['$q', '$rootScope', function ($q, $rootScope) {

	var factory = {};

	var places = [];

	var placesIteration = 0;

	factory.getPlaces = function(map, coords, area, interests, max) {
		var deferred = $q.defer();
		var i;
		var service = new google.maps.places.PlacesService(map);
		service.nearbySearch({location : coords, radius : area, types : interests}, function(results, status, pagination) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				for (i = 0; i < results.length; i++) { 
					places.push(results[i]);
				}
				if(pagination.hasNextPage && placesIteration < max-1) {
					placesIteration++;
					pagination.nextPage();
				} else {
	                $rootScope.$apply(function() {
	                    deferred.resolve(places);
	                });
	                placesIteration = 0;
	                places = [];
				}
			} else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
				deferred.reject('Nothing Found');
			} else {
				deferred.reject('Service Unavailable');
			}	
		});
		return deferred.promise;
	};

	factory.getPlaceDetail = function(map, id) {
		var deferred = $q.defer();
		var service = new google.maps.places.PlacesService(map);
		service.getDetails({placeId : id}, function(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				if (results.photos) {
					for (var i = 0; results.photos.length > i; i++) {
						results.photos[i].photoSmall = results.photos[i].getUrl({'maxWidth': 100, 'maxHeight': 100});
						results.photos[i].photoBig = results.photos[i].getUrl({'maxWidth': 600, 'maxHeight': 600});
					}
				}
				results.overlayImage = false;
				results.overlayRatings = false;
                $rootScope.$apply(function() {
                    deferred.resolve(results);
                });
			} else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
				deferred.reject({error : 'Nothing Found'});
			} else {
				deferred.reject({error : 'Service Unavailable'});
			}
		});
		return deferred.promise;
	};

	return factory;
}]);

angular.module('filters', [])
	.filter('underscoreToSpace', function () {
		return function (input) {
			if (input) {
				return input.toLowerCase().replace(/_/g, ' ');
			}
		};
	}
).filter('toAZ', function () {
		return function (input) {
			if (input) {
				if (input <= 26 && input >= 1) {
					return String.fromCharCode(input + 64);
				} else {
					return input;
				}
			}
		};
	}
).filter('ratingToStar', function () {
		return function (input) {
			if (typeof input === "number") {
				if (input <= 5 && input >= 1) {
					var fullStar = Math.round(input),
						string = "";
					for (var i = 0; i < fullStar; i++)  {
						string = string + "&#xf005; "
					} 
					return string;
				} else {
					return input;
				}
			}
		};
	}
).filter('priceRating', function () {
		return function (input) {
			if (typeof input === "number") {
				if (input <= 4 && input >= 0) {
					var string = "";
					for (var i = 0; i <= input; i++)  {
						string = string + "&#xf155; "
					} 
					return string;
				} else {
					return input;
				}
			}
		};
	}
).filter('toHTML', ['$sce', function ($sce) {
		return function (input) {
			if (input) {
				return $sce.trustAsHtml(input);
			}
		};
	}]
);