(function() {
    'use strict';

    angular
        .module('app.home')
        .controller('HomeController', HomeController);

    HomeController.inject = ['$http', 'LoginService', 'ProfilesService', 'AlertService'];

    function HomeController($http, LoginService, ProfilesService, AlertService, LoadLoginData) {
        console.log("HomeController called.");

        var vm = this;
        vm.isLogged = isLogged;
        vm.getDateByTimestamp = getDateByTimestamp;

        if (isLogged()) {
            vm.user = LoginService.userLogged();
            //New user with no historical
            if (vm.user.historical == undefined) {
                var historical = {
                    "addedFriends" : [],
                    "deletedFriends" : []
                }
                vm.user.historical = historical;
            }
            vm.changes = {};
            vm.addedProfiles = {};
            vm.deletedProfiles = {};
            vm.noChanges = false;
            vm.internalError = false;
            var i = 0;
            var j = 0;
            ProfilesService.getUserChanges(vm.user.steamid).then(function(response) {
                    vm.changes = response.data;
                    if (vm.changes.addedFriends.length < 1 && vm.changes.deletedFriends.length < 1) {
                        vm.noChanges = true;
                    } else {
                        console.log(vm.changes);
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

                    var array1 = vm.user.historical.addedFriends.concat(vm.changes.addedFriends);
                    console.log("array1 - Concatenacion added historical y changes")
                    console.log(array1)
                    var array2 = vm.user.historical.deletedFriends.concat(vm.changes.deletedFriends);
                    console.log("array2 - Concatenacion deleted historical y changes")
                    console.log(array2)
                    var historical = {
                        'addedFriends': array1,
                        'deletedFriends': array2
                    }
                    console.log("HISTORICAL")
                    console.log(historical)
                    ProfilesService.updateUserFriendslist(vm.user.steamid, historical).then(function(response) {
                            AlertService.addAlert('success', 'Stored list updated!');
                        })
                        .catch(function(data) {
                            AlertService.addAlert('danger', 'Stored list was not updated!');
                        });
                })
                .catch(function(data) {
                    AlertService.addAlert('danger', 'Stored list was not updated!');
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
    }
})();
