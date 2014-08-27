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



app.factory('skeleton', function($http) {

	var factory = {};

	factory.callConfigurations = function() {
		var promise = $http.get('json/skeleton.json').then(function (results) {
			return results.data;
		});
		return promise;
	};

	return factory;
});