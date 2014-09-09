var sessionStorageKeys = {
	skeleton : 'skeleton_data'
};

var GLOBALCONTROLS = {
	menu : function () {
		var body = $('body');

		if (body.hasClass('activeMenu')) {
			body.removeClass('activeMenu');
		} else {
			body.addClass('activeMenu');
		}
	}
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

app.controller('menu', function($scope, $location, skeletonFactory) {
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

$(function() {
	$('#hamburguerMenu').click(function(event) {
		event.preventDefault();
		GLOBALCONTROLS.menu();
	});
});