(function() {
    'use strict';

    angular
        .module('app.friendslist')
        .controller('FriendslistController', FriendslistController);

    FriendslistController.inject = ['$http', 'LoginService', 'ProfilesService'];

    function FriendslistController($http, LoginService, ProfilesService) {
        var vm = this;

        vm.isLogged = isLogged;
        vm.userLogged = userLogged;
        vm.getDateByTimestamp = getDateByTimestamp;
        vm.firstHalfProfiles = {};
        vm.secondHalfProfiles = {};

        vm.users = {}
        vm.internalError = false;
        vm.user = userLogged();

        ProfilesService.getUserFriendslist(vm.user.steamid)
            .then(function(response) {
                vm.friendslist = response.data.friendslist.friends;
                var i = 0;
                vm.friendslist.forEach(function(user) {
                    ProfilesService.getFriendProfile(user.steamid)
                        .then(function(response) {
                            vm.users[i] = response.data.response.players[0];
                            vm.users[i]['friendSince'] = user.friend_since;
                            i++;
                        })
                        .catch(function(data) {
                            vm.internalError = true;
                        });
                });
            })
            .catch(function(data) {
                vm.friendslist = [];
                vm.internalError = true;
            });

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
