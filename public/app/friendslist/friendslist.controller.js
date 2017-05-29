(function() {
    'use strict';

    angular
        .module('app.friendslist')
        .controller('FriendslistController', FriendslistController);

    FriendslistController.inject = ['$http', 'LoginService', 'ProfilesService'];

    function FriendslistController(  $scope, $http, LoginService, ProfilesService) {
        console.log("FriendslistController called.");

        var vm = this;
        vm.isLogged = isLogged;
        vm.getDateByTimestamp = getDateByTimestamp;

        if (isLogged()) {
              vm.user = LoginService.userLogged();
              vm.users = {}
              vm.internalError = false;

              ProfilesService.getUserFriendslist(vm.user.steamid)
                  .then(function(response) {
                      vm.friendslist = response.data.friendslist.friends;
                      var i = 0;
                      vm.friendslist.forEach(function(user) {
                          ProfilesService.getFriendProfile(user.steamid)
                              .then(function(response) {
                                  vm.users[i] = response.data.response.players[0];
                                  vm.users[i]['friendSince'] = user.friend_since;
                                  i++;
                              })
                              .catch(function(data) {
                                  vm.internalError = true;
                              });
                      });
                      console.log(vm.users)
                  })
                  .catch(function(data) {
                      vm.friendslist = [];
                      vm.internalError = true;
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
