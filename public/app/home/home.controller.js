(function() {
    'use strict';

    angular
        .module('app.home')
        .controller('HomeController', HomeController);

    HomeController.inject = ['$http', 'LoginService', 'FriendsService'];

    function HomeController($http, LoginService, ProfilesService) {
        var vm = this;

        vm.isLogged = isLogged;
        vm.userLogged = userLogged;
        vm.getDateByTimestamp = getDateByTimestamp;
        if (isLogged()) {
            vm.user = userLogged();
            vm.addedProfiles = {};
            vm.deletedProfiles = {};
            vm.noChanges = false;
            var i = 0;
            var j = 0;
            ProfilesService.getUserChanges(vm.user.steamid).then(function(response) {
                vm.changes = response.data;
                console.log(vm.changes)
                if (vm.changes.addedFriends.length < 1 && vm.changes.deletedFriends.length < 1 ) {
                    vm.noChanges = true;
                } else {
                    vm.changes.addedFriends.forEach(function(user) {
                        ProfilesService.getFriendProfile(user.steamid).then(function(response) {
                            vm.addedProfiles[i] = response.data.response.players[0];
                            vm.addedProfiles[i]['friendSince'] = user.friend_since;
                            i++;
                        });
                    });
                    vm.changes.deletedFriends.forEach(function(user) {
                        ProfilesService.getFriendProfile(user.steamid).then(function(response) {
                            vm.deletedProfiles[j] = response.data.response.players[0];
                            vm.deletedProfiles[j]['friendSince'] = user.friend_since;
                            j++;
                        });
                    });


                }
                //ProfilesService.updateUserFriendslist(vm.user.steamid);
            });

        }

        function getDateByTimestamp(timestamp) {
            return ProfilesService.getDateByTimestamp(timestamp);
        }

        function isLogged() {
            return LoginService.isLogged();
        }

        function userLogged() {
            return LoginService.userLogged();
        }

    }
})();
