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

        vm.updateUserFriendlist = function(steamid) {
            return $http.patch("/api/users/" + steamid);
        };

    }
})();
