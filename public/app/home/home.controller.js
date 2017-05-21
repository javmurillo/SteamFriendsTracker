(function() {
    'use strict';

    angular
        .module('app.home')
        .controller('HomeController', HomeController);

    HomeController.inject = ['LoginService', 'FriendsService'];

    function HomeController($http, LoginService, FriendsService) {
        var vm = this;

        vm.isLogged = isLogged;
        vm.userLogged = userLogged;
        vm.getDateByTimestamp = getDateByTimestamp;
        if (isLogged()) {
            vm.user = userLogged();
            vm.addedProfiles = {};
            vm.deletedProfiles = [];
            var i = 0;
            var j = 0;
            FriendsService.getUserChanges(vm.user.steamid).then(function(response) {
                  vm.changes = response.data;
                  vm.changes.addedFriends.forEach(function(user) {
                    FriendsService.getFriendProfile(user.steamid).then(function(response) {
                          vm.addedProfiles[i] = response.data.response.players[0];
                          vm.addedProfiles[i]['friendSince'] = user.friend_since;
                          i++;
                      });
                  });
                  vm.changes.deletedFriends.forEach(function(user) {
                    FriendsService.getFriendProfile(user.steamid).then(function(response) {
                          vm.deletedProfiles[j] = response.data.response.players[0];
                          vm.deletedProfiles[j]['friendSince'] = user.friend_since;
                          j++;
                    });
                  });
                  console.log(vm.addedProfiles);

                  /*FriendsService.updateUserFriendlist(vm.user.steamid).then(
                      function(response) { //success
                          console.log("NO ERROR");

                      },
                      function(response) { //error
                          console.log("ERROR");
                      }
                  );*/

              });


        }

        function getDateByTimestamp(timestamp) {
          return FriendsService.getDateByTimestamp(timestamp);
        }

        function isLogged() {
            return LoginService.isLogged();
        }

        function userLogged() {
            return LoginService.userLogged();
        }

    }
})();
