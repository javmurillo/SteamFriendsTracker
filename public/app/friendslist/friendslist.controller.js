(function() {
    'use strict';

    angular
        .module('app.friendslist')
        .controller('FriendslistController', FriendslistController);

    FriendslistController.inject = ['$http', 'LoginService', 'ProfilesService'];

    function FriendslistController($http, LoginService, ProfilesService) {
        console.log("FriendslistController called.");

        var vm = this;
        vm.isLogged = isLogged;
        vm.getDateByTimestamp = getDateByTimestamp;
        vm.filter = filter;

        if (isLogged()) {
            vm.user = LoginService.userLogged();
            vm.users = [];
            vm.friendSinceArray = [];
            vm.internalError = false;
            vm.privateProfile = false;
            var steamIdsArray = []
            var i = 0;
            ProfilesService.getUserFriendslist(vm.user.steamid)
                .then(function(response) {
                      var i = 0;
                      vm.friendslist = response.data.friendslist.friends;
                      angular.forEach(vm.friendslist, function(user) {
                          steamIdsArray.push(user.steamid);
                          vm.friendSinceArray[i] = getDateByTimestamp(user.friend_since);
                          i++;
                      })
                      console.log(steamIdsArray)
                      var i = 0;

                      ProfilesService.getFriendProfile(steamIdsArray).then(function(response) {
                        angular.forEach(response.data.response.players, function(user) {
                              vm.users = response.data.response.players;
                              //We sort vm.users array in order to fit the vm.friendSinceArray array
                              vm.users.sort(function(a, b) {
                                    return a.steamid - b.steamid;
                              });
                              vm.users[i]['friendsSince'] = vm.friendSinceArray[i]
                              i++
                            })
                            console.log(vm.users)
                            vm.filteredUsers = vm.users;


                          })
                          .catch(function(data) {
                              vm.internalError = true;
                          });

                })
                .catch(function(data) {
                    vm.friendslist = [];
                    if (data.data.error == "Profile set to private") {
                        vm.privateProfile = true;
                    }
                    else vm.internalError = true;
                });

        }

        function filter(query) {
          /*vm.users.sort(function (a, b) {
              return a.personaname.localeCompare(b.personaname);
          });*/
            vm.filteredUsers = [];
            for (var i = 0; i < vm.users.length; i++) {
                if (vm.users[i].personaname.toLowerCase().startsWith(query.toLowerCase()) ||
                    vm.users[i].steamid.toLowerCase().startsWith(query.toLowerCase()) ||
                    vm.users[i].friendsSince.toLowerCase().includes(query.toLowerCase())) {
                    vm.filteredUsers.push(vm.users[i]);
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
