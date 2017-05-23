(function() {
    'use strict';

    angular
        .module('app', [
            'ngSanitize',
            'ui.router',
            'ngAnimate',
            'angular-loading-bar',
            'app.home',
            'app.login',
            'app.profiles',
            'app.layout',
            'app.layout.navbar'
        ])
        .config(function($stateProvider, $urlRouterProvider, $logProvider, $locationProvider) {
            $logProvider.debugEnabled(true);
            $locationProvider.html5Mode(true);
            $urlRouterProvider.otherwise('/');
            $stateProvider
                .state('home', {
                    url: '/',
                    templateUrl: 'app/home/home.html',
                    controller: 'HomeController as vm',
                    resolve: {
                        'LoadLoginData': function(LoginService) {
                            return LoginService.getIdentity;
                        }
                    }

                });
        });
})();
