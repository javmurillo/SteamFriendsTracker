(function() {
    'use strict';

    angular
        .module('app.home')
        .controller('HomeController', HomeController);

    HomeController.inject = ['$http', 'LoginService', 'ProfilesService'];

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
            vm.internalError = false;
            var i = 0;
            var j = 0;
            ProfilesService.getUserChanges(vm.user.steamid).then(function(response) {
                    console.log("primero");
                    vm.changes = response.data;
                    console.log(vm.changes)
                    if (vm.changes.addedFriends.length < 1 && vm.changes.deletedFriends.length < 1) {
                        vm.noChanges = true;
                    } else {
                        vm.changes.addedFriends.forEach(function(user) {
                            ProfilesService.getFriendProfile(user.steamid)
                                .then(function(response) {
                                    console.log(response)
                                    vm.addedProfiles[i] = response.data.response.players[0];
                                    vm.addedProfiles[i]['friendSince'] = user.friend_since;
                                    i++;
                                })
                                .catch(function(data) {
                                    vm.internalError = true;
                                });
                        });
                        vm.changes.deletedFriends.forEach(function(user) {
                            ProfilesService.getFriendProfile(user.steamid)
                                .then(function(response) {
                                    vm.deletedProfiles[j] = response.data.response.players[0];
                                    vm.deletedProfiles[j]['friendSince'] = user.friend_since;
                                    j++;
                                })
                                .catch(function(data) {
                                    vm.internalError = true;
                                });
                        });
                    }
                    ProfilesService.updateUserFriendslist(vm.user.steamid).then(function(response) {
                            console.log(response);
                        })
                        .catch(function(data) {
                            console.log(data);

                            vm.internalError = true;
                        });
                })
                .catch(function(data) {
                    console.log(data);
                    vm.changes = {};
                    vm.changes.addedFriends = [];
                    vm.changes.deletedFriends = [];
                    vm.internalError = true;
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
