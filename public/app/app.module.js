(function() {
    'use strict';

    angular
        .module('app', [
            'ngSanitize',
            'ui.router',
            'ngAnimate',
            'angular-loading-bar',
            'app.home',
            'app.friendslist',
            'app.historical',
            'app.stats',
            'app.login',
            'app.profiles',
            'app.layout'
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
                            return LoginService.getIdentity();
                        }
                    }
                })
                .state('friendslist', {
                    url: '/friendslist',
                    templateUrl: 'app/friendslist/friendslist.html',
                    controller: 'FriendslistController as vm',
                    resolve: {
                        'LoadLoginData': function(LoginService) {
                            return LoginService.getIdentity();
                        }
                    }
                })
                .state('historical', {
                    url: '/historical',
                    templateUrl: 'app/historical/historical.html',
                    controller: 'HistoricalController as vm',
                    resolve: {
                        'LoadLoginData': function(LoginService) {
                            return LoginService.getIdentity();
                        }
                    }
                })
                .state('stats', {
                    url: '/stats',
                    templateUrl: 'app/stats/stats.html',
                    controller: 'StatsController as vm',
                    resolve: {
                        'LoadLoginData': function(LoginService) {
                            return LoginService.getIdentity();
                        }
                    }
                });
        });
})();
