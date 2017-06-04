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
            var promises = [];
            var steamIdsArray = []
            var labelsAux = [];
            var labelsAux2 = [];
            var labelsAux3 = [];
            var dataAux = [];
            var dataAux2 = [];
            var dataAux3 = [];
            var dataVAC = [0];
            var totalLevel = 0;
            vm.levelAverage = "Loading...";
            vm.pairKeyValue1 = [];
            vm.pairKeyValue2 = [];
            vm.users = [];
            console.log(dataVAC);
            // -- ADDED FRIENDS BY YEAR CHART --
            ProfilesService.getUserFriendslist(vm.user.steamid)
                .then(function(response) {
                    vm.friendslist = response.data.friendslist.friends;
                    console.log(vm.friendslist.length);
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
                    vm.pairKeyValue1.forEach(function(value, key) {
                        dataAux.push(value)
                    })
                    vm.addedByYearChart = {
                          "data": dataAux,
                          "labels": labelsAux
                    };
                    //ACCOUNTS AGE BY YEAR
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
                            vm.pairKeyValue2.forEach(function(value, key) {
                                dataAux2.push(value)
                            })
                            vm.accountsAgeByYearChart = {
                                  "data": dataAux2,
                                  "labels": labelsAux2
                            };
                        })
                        .catch(function(data) {
                            vm.internalError = true;
                        });

                    //VAC'D FRIENDS
                    ProfilesService.getVacInfo(steamIdsArray).then(function(response) {
                      console.log(response);
                            angular.forEach(response.data.players, function(user) {
                              if (user.VACBanned) {
                                dataVAC[0]++;
                              }
                            })
                            dataVAC[1] = vm.friendslist.length - dataVAC[0];
                            vm.vacChart = {
                                  "data": dataVAC,
                                  "labels": ['VAC Friends', 'Nice friends'],
                                  "colours": ['#E31B54','#5BC99D']
                            };
                        })
                        .catch(function(data) {
                            vm.internalError = true;
                        });

                  angular.forEach(steamIdsArray, function(steamid) {
                        promises.push(ProfilesService.getFriendLevel(steamid));
                    })
                    $q.all(promises).then(function(response) {

                        angular.forEach(response, function(response) {
                           totalLevel = totalLevel + response.data.response.player_level;
                          console.log(totalLevel);
                          //console.log(response);
                        })
                        vm.levelAverage = 0;
                        vm.levelAverage = (totalLevel/vm.friendslist.length).toFixed(2);
                    })
                    .catch(function(data) {
                        vm.internalError = true;
                    });


                })
                .catch(function(data) {
                    //TODO: ERROR HANDLING
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
