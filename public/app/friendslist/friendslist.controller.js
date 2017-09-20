(function() {
    'use strict';

    angular
        .module('app.friendslist')
        .controller('FriendslistController', FriendslistController);

    FriendslistController.inject = ['$http', 'LoginService', 'ProfilesService'];

    function FriendslistController($scope, $http, LoginService, ProfilesService) {
        console.log("FriendslistController called.");

        var vm = this;
        vm.options = [{ id: 1,
            name: 'SteamID'
        }, { id: 2,
            name: 'Username'
        }, { id: 3,
            name: 'Date'
        }];

        vm.sort = function(query) {
            console.log(query)
            if (query.id == 1) {
                vm.filteredUsers.sort(function(a, b) {
                    return a.steamid.localeCompare(b.steamid);
                })
            } else if (query.id == 2) {
                vm.filteredUsers.sort(function(a, b) {
                    return a.personaname.localeCompare(b.personaname);
                })
            } else if (query.id == 3) {
                console.log(vm.users)
                vm.filteredUsers.sort(function(a, b) {
                    return new Date(a.friendsSince) - (new Date(b.friendsSince));
                })
            }
        }

        vm.isLogged = isLogged;
        vm.getDateByTimestamp = getDateByTimestamp;
        vm.filter = filter;

        if (isLogged()) {
            vm.user = LoginService.userLogged();
            vm.users = [];
            vm.friendsSinceArray = [];
            vm.filteredUsers = [];
            vm.internalError = false;
            vm.privateProfile = false;
            var steamIdsArray = [];
            var i = 0;
            ProfilesService.getUserFriendslist(vm.user.steamid)
                .then(function(response) {
                    vm.friendslist = response.data.friendslist.friends;
                    angular.forEach(vm.friendslist, function(user) {
                        steamIdsArray.push(user.steamid);
                        vm.friendsSinceArray[user.steamid] = getDateByTimestamp(user.friend_since);
                    })
                    var number = Math.ceil(steamIdsArray.length / 100);
                    for (var j = 1; j <= number; j++) {
                        ProfilesService.getFriendProfile(steamIdsArray).then(function(response) {
                                i = 0;
                                vm.users = response.data.response.players;
                                angular.forEach(vm.users, function(user) {
                                    vm.users[i]['friendsSince'] = vm.friendsSinceArray[vm.users[i].steamid];
                                    i++;
                                })
                                vm.filteredUsers = vm.filteredUsers.concat(vm.users);
                                vm.users = vm.filteredUsers;
                            })
                            .catch(function(data) {
                                vm.internalError = true;
                            });
                        steamIdsArray = steamIdsArray.slice(100, steamIdsArray.length);
                    }
                })
                .catch(function(data) {
                    vm.friendslist = [];
                    if (data.data.error == "Profile set to private") {
                        vm.privateProfile = true;
                    } else vm.internalError = true;
                });
        }

        function filter(query) {
            console.log(vm.friendslist.length);
            console.log(vm.filteredUsers.length);
            if (vm.users.length == vm.friendslist.length) {
                vm.filteredUsers = [];
                for (var j = 0; j < vm.users.length; j++) {
                    if (vm.users[j].personaname.toLowerCase().startsWith(query.toLowerCase()) ||
                        vm.users[j].steamid.toLowerCase().startsWith(query.toLowerCase()) ||
                        vm.users[j].friendsSince.toLowerCase().includes(query.toLowerCase())) {
                        vm.filteredUsers.push(vm.users[j]);
                    }
                }
            }
        }

        function getDateByTimestamp(timestamp) {
            return ProfilesService.getDateByTimestamp(timestamp);
        }

        function isLogged() {
            return LoginService.isLogged();
        }
    }
})();
