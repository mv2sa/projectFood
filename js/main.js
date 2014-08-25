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
		}
	});
});