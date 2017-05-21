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

        if (isLogged()) {
            vm.user = userLogged();
            vm.addedProfiles = [];
            vm.deletedProfiles = [];

            FriendsService.getUserChanges(vm.user.steamid).then(function(response) {
                  vm.changes = response.data;
                  for (var i=0; i<vm.changes.addedFriends.length; i++) {
                    FriendsService.getFriendProfile(vm.changes.addedFriends[i].steamid).then(function(response) {
                          vm.addedProfiles.push(response.data.response.players[0]);
                          console.log(vm.addedProfiles)
                    });
                  }

                  for (var i=0; i<vm.changes.deletedFriends.length; i++) {
                    FriendsService.getFriendProfile(vm.changes.deletedFriends[i].steamid).then(function(response) {
                          vm.deletedProfiles.push(response.data.response.players[0]);
                          console.log(vm.deletedProfiles)
                    });
                  }

                  /*
                  for (var i=0; i<vm.changes.addedFriends.length; i++) {
                    console.log(vm.changes.addedFriends[i].steamid);
                    var addedStringIDs = addedStringIDs + vm.changes.addedFriends[i].steamid + ',';
                  }

                  FriendsService.getFriendProfile(addedStringIDs).then(function(response) {
                        console.log(response);
                        vm.friendsProfiles.push(response.data.response.players);
                        console.log(vm);

                  });

                  for (var i=0; i<vm.changes.deletedFriends.length; i++) {
                    console.log(vm.changes.deletedFriends[i].steamid);
                    var deledtedStringIDs = deledtedStringIDs + vm.changes.deletedFriends[i].steamid + ',';
                  }


                  FriendsService.getFriendProfile(deledtedStringIDs).then(function(response) {
                        console.log(response);
                        vm.friendsProfiles.push(response.data.response.players);
                        console.log(vm);

                  });

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

        function isLogged() {
            return LoginService.isLogged();
        }

        function userLogged() {
            return LoginService.userLogged();
        }

    }
})();
