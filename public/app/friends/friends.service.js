(function() {
    'use strict';

    angular
        .module('app.friends')
        .service('FriendsService', FriendsService);

    function FriendsService($http) {
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
    }
})();
