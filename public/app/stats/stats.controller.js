(function() {
    'use strict';

    angular
        .module('app.stats')
        .controller('StatsController', StatsController);

    StatsController.inject = ['$q', '$http', 'LoginService', 'ProfilesService', 'NgTableParams'];

    function StatsController($q, $http, LoginService, ProfilesService, NgTableParams) {
        var vm = this;
        vm.isLogged = isLogged;
        vm.getDateByTimestamp = getDateByTimestamp;

        if (isLogged()) {
            vm.user = LoginService.userLogged();
            var labelsAux = [];
            var labelsAux2 = [];
            var dataAux = [];
            var dataAux2 = [];
            vm.pairKeyValue1 = [];
            vm.pairKeyValue2 = [];
            vm.users = [];
            var promises = [];
            var steamIdsArray = []
            // -- ADDED FRIENDS BY YEAR CHART --
            ProfilesService.getUserFriendslist(vm.user.steamid)
                .then(function(response) {
                    vm.friendslist = response.data.friendslist.friends;
                    console.log(vm.friendslist);
                    vm.friendslist.forEach(function(user) {
                        var date = new Date(user.friend_since * 1000);
                        var year = date.getFullYear();
                        vm.pairKeyValue1[year] = vm.pairKeyValue1[year] + 1 || 1;
                        if (labelsAux.indexOf(year) == -1) {
                            labelsAux.push(year);
                        }
                        steamIdsArray.push(user.steamid);
                    })

                    labelsAux.sort();
                    vm.labelsChart1 = labelsAux;
                    vm.pairKeyValue1.forEach(function(value, key) {
                        dataAux.push(value)
                    })
                    vm.dataChart1 = dataAux;

                    ProfilesService.getFriendProfile(steamIdsArray).then(function(response) {
                            angular.forEach(response.data.response.players, function(user) {
                                var date = new Date(user.timecreated * 1000);
                                if (date != "Invalid Date") {
                                    var year = date.getFullYear();
                                    vm.pairKeyValue2[year] = vm.pairKeyValue2[year] + 1 || 1;
                                    if (labelsAux2.indexOf(year) == -1) {
                                        labelsAux2.push(year);
                                    }
                                }
                            })
                            labelsAux2.sort();
                            vm.labelsChart2 = labelsAux2;
                            vm.pairKeyValue2.forEach(function(value, key) {
                                dataAux2.push(value)
                            })
                            vm.dataChart2 = dataAux2;
                        })
                        .catch(function(data) {
                            vm.internalError = true;
                        });

                })
                .catch(function(data) {
                    //TODO: ERROR HANDLING
                });




            // -- HOW OLD THE FRIENDS ACCOUNT ARE CHART --
        }

        function getDateByTimestamp(timestamp) {
            return ProfilesService.getDateByTimestamp(timestamp);
        }

        function isLogged() {
            return LoginService.isLogged();
        }
    }
})();
