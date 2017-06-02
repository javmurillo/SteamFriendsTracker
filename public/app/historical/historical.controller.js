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
            var i = 0;
            var j = 0;
            //User with no historical
            if (!vm.user.historical) {
                console.log("User with no historical.")
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
                console.log("Empty arrays.")
                vm.emptyArrays = true;
            }
            else {
                console.log("Added Friends Promises...")
                var promises = [];
                angular.forEach(vm.user.historical.addedFriends, function(user) {
                    promises.push(ProfilesService.getFriendProfile(user.steamid));
                    vm.addedFriendSinceArray[i] = new Date(getDateByTimestamp(user.friend_since));
                    i++;
                })
                var i = 0;
                $q.all(promises).then(function(response) {
                        response.forEach(function(response) {
                            vm.addedProfiles[i] = response.data.response.players[0];
                            vm.addedProfiles[i]['friendsSince'] = vm.addedFriendSinceArray[i]
                            i++;
                        })
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

                console.log("Removed Friends Promises...")
                var promises = [];
                angular.forEach(vm.user.historical.deletedFriends, function(user) {
                    promises.push(ProfilesService.getFriendProfile(user.steamid));
                    vm.deletedFriendSinceArray[j] = new Date(getDateByTimestamp(user.friend_since));
                    j++;
                })
                var j = 0;
                $q.all(promises).then(function(response) {
                        response.forEach(function(response) {
                            vm.deletedProfiles[j] = response.data.response.players[0];
                            vm.deletedProfiles[j]['friendsSince'] = vm.deletedFriendSinceArray[j]
                            j++;
                        })
                        vm.removedFriendsTable = new NgTableParams({
                            count: 10
                        }, {
                            dataset: vm.deletedProfiles,
                            counts: [5, 10, 20]
                        });
                        vm.isLoadingRemoved = false;

                    })
                    .catch(function(data) {
                        vm.internalError = true;
                    });
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
