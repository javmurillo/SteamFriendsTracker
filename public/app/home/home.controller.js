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
            if (!vm.user.historical) {
                console.log("User with no historical")
                var historical = {
                    "addedFriends": [],
                    "deletedFriends": []
                }
                vm.user.historical = historical;
            }
            vm.changes = {};
            vm.addedProfiles = {};
            vm.deletedProfiles = {};
            vm.noChanges = false;
            vm.internalError = false;
            vm.privateProfile = false;
            var i = 0;
            var j = 0;

            ProfilesService.getUserChanges(vm.user.steamid).then(function(response) {
                    vm.changes = response.data;
                    if (vm.changes.addedFriends.length < 1 && vm.changes.deletedFriends.length < 1) {
                        vm.noChanges = true;
                    }
                    else {
                        //We could avoid calling our Server multiple times by passing an array with
                        //all the friend's steamids (like Friendslist or Historical), in
                        //this way, we improve the code legibility without a real impact in the performance.
                        vm.changes.addedFriends.forEach(function(user) {
                            ProfilesService.getFriendProfile(user.steamid)
                                .then(function(response) {
                                    vm.addedProfiles[i] = response.data.response.players[0];
                                    vm.addedProfiles[i]['friendsSince'] = getDateByTimestamp(user.friend_since);
                                    console.log(user.friend_since)
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
                                    vm.deletedProfiles[j]['friendsSince'] = getDateByTimestamp(user.friend_since);
                                    j++;
                                })
                                .catch(function(data) {
                                    vm.internalError = true;
                                });
                        });
                    }

                    var array1 = vm.user.historical.addedFriends.concat(vm.changes.addedFriends);
                    var array2 = vm.user.historical.deletedFriends.concat(vm.changes.deletedFriends);
                    var historical = {
                        'addedFriends': array1,
                        'deletedFriends': array2
                    }
                    ProfilesService.updateUser(vm.user.steamid, historical).then(function(response) {
                            AlertService.addAlert('success', 'Stored list updated!');
                        })
                        .catch(function(data) {
                            if (data.data.error == "Profile set to private") {
                                vm.privateProfile = true;
                            }
                            AlertService.addAlert('danger', 'Stored list was not updated!');
                        });
                })
                .catch(function(data) {
                    AlertService.addAlert('danger', 'Stored list was not updated!');
                    vm.changes.addedFriends = [];
                    vm.changes.deletedFriends = [];

                    if (data.data.error == "Profile set to private") {
                        vm.privateProfile = true;
                    } else vm.internalError = true;
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
