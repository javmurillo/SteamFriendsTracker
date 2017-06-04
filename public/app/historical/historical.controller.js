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
            }
            else {
                if (vm.user.historical.addedFriends.length >= 1) {
                    angular.forEach(vm.user.historical.addedFriends, function(user) {
                        steamIdsArray.push(user.steamid);
                        vm.addedFriendSinceArray[i] = new Date(getDateByTimestamp(user.friend_since));
                        i++;
                    })
                    i = 0;
                    ProfilesService.getFriendProfile(steamIdsArray)
                        .then(function(response) {
                            vm.addedProfiles = response.data.response.players;
                            vm.addedProfiles.sort(function(a, b) {
                                return a.steamid - b.steamid;
                            });
                            angular.forEach(vm.addedProfiles, function(user) {
                                vm.addedProfiles[i]['friendsSince'] = vm.addedFriendSinceArray[i];
                                i++
                            })
                            vm.addedFriendsTable = new NgTableParams({
                                count: 10
                            }, {
                                dataset: vm.addedProfiles,
                                counts: [5, 10, 20]
                            });
                            console.log(vm.addedProfiles)
                            vm.isLoadingAdded = false;
                        })
                        .catch(function(data) {
                            vm.internalError = true;
                        });
                }
                steamIdsArray = [];
                if (vm.user.historical.deletedFriends.length >= 1) {
                    angular.forEach(vm.user.historical.deletedFriends, function(user) {
                        steamIdsArray.push(user.steamid);
                        //vm.friendSinceArray[i] = getDateByTimestamp(user.friend_since);
                        vm.deletedFriendSinceArray[j] = new Date(getDateByTimestamp(user.friend_since));
                        j++;
                    })
                    j = 0;
                    ProfilesService.getFriendProfile(steamIdsArray)
                        .then(function(response) {
                            vm.deletedProfiles = response.data.response.players;
                            vm.deletedProfiles.sort(function(a, b) {
                                return a.steamid - b.steamid;
                            });
                            angular.forEach(response.data.response.players, function(user) {
                                vm.deletedProfiles[j]['friendsSince'] = vm.deletedFriendSinceArray[j];
                                j++
                            })
                            vm.removedFriendsTable = new NgTableParams({
                                count: 10
                            }, {
                                dataset: vm.deletedProfiles,
                                counts: [5, 10, 20]
                            });
                            console.log(vm.deletedProfiles)
                            vm.isLoadingRemoved = false;
                        })
                        .catch(function(data) {
                            console.log(data)
                            vm.internalError = true;
                        });
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
