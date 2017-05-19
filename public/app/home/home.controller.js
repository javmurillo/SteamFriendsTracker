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
            console.log(vm.user.steamid);
            FriendsService.getUserChanges(vm.user.steamid).then(function(response) {
              console.log(response.data);
                  vm.changes = response.data;

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
