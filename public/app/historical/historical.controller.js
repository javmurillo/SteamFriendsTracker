(function() {
    'use strict';

    angular
        .module('app.historical')
        .controller('HistoricalController', HistoricalController);

    HistoricalController.inject = ['$q', '$http', 'LoginService', 'ProfilesService', 'NgTableParams'];

    function HistoricalController($q, $http, LoginService, ProfilesService, NgTableParams) {
        console.log("HistoricalController called.");

        var vm = this;
        vm.isLogged = isLogged;
        vm.getDateByTimestamp = getDateByTimestamp;

        if (isLogged()) {
            vm.user = LoginService.userLogged();
            vm.addedProfiles = [];
            vm.deletedProfiles = [];
            vm.addedFriendSinceArray = [];
            vm.deletedFriendSinceArray = [];
            vm.isLoadingAdded = true;
            vm.isLoadingRemoved = true;
            vm.noHistorical = false;
            var steamIdsArray = [];
            var i = 0;
            var j = 0;
            //User with no historical
            if (!vm.user.historical) {
                vm.noHistorical = true;
                vm.emptyArrays = true;
                //We set the historical var in order to display "0"s
                var historical = {
                    "addedFriends": [],
                    "deletedFriends": []
                }
                vm.user.historical = historical;
            }
            //If empty array
            else if (vm.user.historical.addedFriends.length < 1 && vm.user.historical.deletedFriends < 1) {
                vm.emptyArrays = true;
            } else {
                if (vm.user.historical.addedFriends.length >= 1) {
                    angular.forEach(vm.user.historical.addedFriends, function(user) {
                        steamIdsArray.push(user.steamid);
                        vm.addedFriendSinceArray[user.steamid] = new Date(getDateByTimestamp(user.friend_since));
                    })
                    var number = Math.ceil(steamIdsArray.length / 100);
                    for (var h = 1; h <= number; h++) {

                        ProfilesService.getFriendProfile(steamIdsArray)
                            .then(function(response) {
                                i = 0;
                                var users = response.data.response.players;
                                angular.forEach(users, function(user) {
                                    users[i]['friendsSince'] = vm.addedFriendSinceArray[users[i].steamid];
                                    console.log(i)
                                    i++;
                                })
                                vm.addedProfiles = vm.addedProfiles.concat(users);
                                vm.addedFriendsTable = new NgTableParams({
                                    count: 10
                                }, {
                                    dataset: vm.addedProfiles,
                                    counts: [5, 10, 20]
                                });

                                vm.isLoadingAdded = false;
                            })
                            .catch(function(data) {

                                vm.internalError = true;
                            });
                        steamIdsArray = steamIdsArray.slice(100, steamIdsArray.length);
                    }
                }
                steamIdsArray = [];
                if (vm.user.historical.deletedFriends.length >= 1) {
                    angular.forEach(vm.user.historical.deletedFriends, function(user) {
                        steamIdsArray.push(user.steamid);
                        //vm.friendSinceArray[i] = getDateByTimestamp(user.friend_since);
                        vm.deletedFriendSinceArray[user.steamid] = new Date(getDateByTimestamp(user.friend_since));
                    })
                    var number = Math.ceil(steamIdsArray.length / 100);
                    for (var h = 1; h <= number; h++) {
                        ProfilesService.getFriendProfile(steamIdsArray)
                            .then(function(response) {
                                j = 0;
                                var users = response.data.response.players;
                                angular.forEach(users, function(user) {
                                    users[j]['friendsSince'] = vm.deletedFriendSinceArray[users[j].steamid];
                                    j++;
                                })
                                vm.deletedProfiles = vm.deletedProfiles.concat(users);
                                vm.removedFriendsTable = new NgTableParams({
                                    count: 10
                                }, {
                                    dataset: vm.deletedProfiles,
                                    counts: [5, 10, 20]
                                });
                                vm.isLoadingRemoved = false;
                            })
                            .catch(function(data) {
                                console.log(data)
                                vm.internalError = true;
                            });
                        steamIdsArray = steamIdsArray.slice(100, steamIdsArray.length);
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
