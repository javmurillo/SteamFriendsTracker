(function() {
    'use strict';

    angular
        .module('app.profiles')
        .service('ProfilesService', ProfilesService);

    function ProfilesService($http, $cacheFactory) {
        console.log("ProfilesService called.");
        var vm = this;
        var cache = $cacheFactory('myCache');

        vm.getUserChanges = function(steamid) {
            return $http.get("/api/users/changes/" + steamid);
        };

        vm.getFriendProfile = function(steamids) {
          return $http.get("/api/steam/profile/" + steamids, { cache: cache  });
        }

        vm.getUserFriendslist = function(steamid) {
            return $http.get("/api/steam/friendslist/" + steamid);
        };

        vm.getVacInfo = function(steamids) {
            return $http.get("/api/steam/vac/" + steamids, { cache: cache  });
        };

        vm.updateUser = function(steamid, historical) {
            var data = {steamid: steamid, historical: historical};
            //$http.defaults.headers.patch["Content-Type"] = "application/json";
            return $http.patch("/api/users/", data);
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
