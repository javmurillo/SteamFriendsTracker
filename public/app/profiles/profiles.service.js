(function() {
    'use strict';

    angular
        .module('app.profiles')
        .service('ProfilesService', ProfilesService);

    function ProfilesService($http) {
        var vm = this;

        vm.getUserChanges = function(steamid) {
            return $http.get("/api/changes/" + steamid);
        };

        vm.getFriendProfile = function(steamids) {
          return $http.get("/api/users/" + steamids);
        }

        vm.updateUserFriendlist = function(steamid) {
            return $http.patch("/api/users/" + steamid);
        };

        vm.getDateByTimestamp = function(timestamp) {
            var a = new Date(timestamp * 1000);
             var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
             var year = a.getFullYear();
             var month = months[a.getMonth()];
             var date = a.getDate();
             var time = date + ' ' + month + ' ' + year;
             return time;
        };
    }
})();
