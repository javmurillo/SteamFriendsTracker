(function() {
    'use strict';

    angular
        .module('app.stats')
        .controller('StatsController', StatsController);

    StatsController.inject = ['$http', 'LoginService', 'ProfilesService', 'NgTableParams'];

    function StatsController($http, LoginService, ProfilesService, NgTableParams) {

    }
})();
