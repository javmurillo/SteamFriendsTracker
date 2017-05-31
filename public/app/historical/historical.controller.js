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
            vm.friendSinceArray = [];
            vm.isLoading = true;
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
            else if (vm.user.historical.addedFriends.length < 1 && vm.user.historical.deletedFriends < 1) {
                console.log("Empty arrays.")
                vm.emptyArrays = true;
            }
            else {
                console.log("Loading Added Friends Promises...")
                var promises = [];
                vm.user.historical.addedFriends.forEach(function(user) {
                    promises.push(ProfilesService.getFriendProfile(user.steamid));
                    vm.friendSinceArray[i] = new Date(getDateByTimestamp(user.friend_since));
                    i++;
                })
                var i = 0;
                console.log("Resolving Added Friends Promises...")
                $q.all(promises).then(function(response) {
                        response.forEach(function(response) {
                            vm.addedProfiles[i] = response.data.response.players[0];
                            vm.addedProfiles[i]['friendsSince'] = vm.friendSinceArray[i]
                            i++;
                        })
                        vm.addedFriendsTable = new NgTableParams({
                            count: 10
                        }, {
                            dataset: vm.addedProfiles,
                            counts: [5, 10, 20]
                        });
                        vm.isLoading = false;

                    })
                    .catch(function(data) {
                        vm.internalError = true;
                    });

                /*vm.user.historical.addedFriends.forEach(function(user) {
                    ProfilesService.getFriendProfile(user.steamid)
                        .then(function(response) {
                            vm.addedProfiles[i] = response.data.response.players[0];
                            vm.addedProfiles[i]['friendSince'] = user.friend_since;

                            vm.addedArray.push(vm.addedProfiles[i]);
                            vm.inventario = new NgTableParams({count: 10}, {dataset: vm.addedArray, counts: [5, 10, 20]});

                            i++;
                        })
                        .catch(function(data) {
                            vm.internalError = true;
                        });
                });*/

                vm.user.historical.deletedFriends.forEach(function(user) {
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

                //vm.tableParams = new NgTableParams({}, { dataset: vm.addedArray});


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
