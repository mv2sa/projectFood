var sessionStorageKeys = {
	skeleton : 'skeleton_data'
};
var app = angular.module('findMyFood', ['ui.router']);

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
	});
});

app.controller('dashboard', function($scope, skeletonFactory) {
	$scope.dashboardItems = {
		loading : true
	};

	var init = function() {
		var storedData;

		storedData = null;//skeletonFactory.getStoredSkeleton();
		if(storedData === null) {
			skeletonFactory.getSkeleton().then(function(d){
				$scope.dashboardItems = d;
			});
		} else {
			$scope.dashboardItems = storedData;
		}
		console.log($scope.dashboardItems);
	};

	init();
});

app.controller('menu', function($scope, skeletonFactory) {
	$scope.menuItems = {
		loading : true
	};

	var init = function() {
		var storedData;

		storedData = null;//skeletonFactory.getStoredSkeleton();
		if(storedData === null) {
			skeletonFactory.getSkeleton().then(function(d){
				$scope.menuItems = d;
			});
		} else {
			$scope.menuItems = storedData;
		}
		console.log($scope.menuItems);
	};

	init();
});

app.factory('skeletonFactory', function($http, $window) {

	var factory = {};

	/*factory.getStoredSkeleton = function() {
		if ($window.Modernizr.sessionstorage) {
			return $window.JSON.parse($window.sessionStorage.getItem($window.sessionStorageKeys.skeleton));
		}
	};*/

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