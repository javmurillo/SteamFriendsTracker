(function() {
    'use strict';

    angular
        .module('app.friendslist')
        .controller('FriendslistController', FriendslistController);

    FriendslistController.inject = ['$http', 'LoginService', 'ProfilesService'];

    function FriendslistController($scope, $http, LoginService, ProfilesService) {
        console.log("FriendslistController called.");

        var vm = this;
        vm.isLogged = isLogged;
        vm.getDateByTimestamp = getDateByTimestamp;
        vm.filter = filter;

        if (isLogged()) {
            vm.user = LoginService.userLogged();
            vm.users = [];
            vm.internalError = false;
            vm.privateProfile = false;

            ProfilesService.getUserFriendslist(vm.user.steamid)
                .then(function(response) {
                      var i = 0;
                      vm.friendslist = response.data.friendslist.friends;
                      vm.friendslist.forEach(function(user) {
                          ProfilesService.getFriendProfile(user.steamid)
                              .then(function(response) {
                                  vm.users[i] = response.data.response.players[0];
                                  vm.users[i]['friendsSince'] = getDateByTimestamp(user.friend_since);
                                  i++;
                              })
                              .catch(function(data) {
                                  vm.internalError = true;
                              });
                      });
                      console.log(vm.users);



                })
                .catch(function(data) {
                    vm.friendslist = [];
                    if (data.data.error == "Profile set to private") {
                        vm.privateProfile = true;
                    }
                    else vm.internalError = true;
                });
            vm.filteredUsers = vm.users;

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
