(function() {
    'use strict';

    angular
        .module('app.stats')
        .controller('StatsController', StatsController);

    StatsController.inject = ['$http', 'LoginService', 'ProfilesService', 'NgTableParams'];

    function StatsController($http, LoginService, ProfilesService, NgTableParams) {
      var vm = this;
      vm.isLogged = isLogged;
      vm.getDateByTimestamp = getDateByTimestamp;

      if (isLogged()) {
          vm.user = LoginService.userLogged();
          vm.labelsaux = [];
          vm.dataaux = [];
          var promises = [];
          vm.pairKeyValue = [];

          ProfilesService.getUserFriendslist(vm.user.steamid)
              .then(function(response) {
                var userFriends = response.data.friendslist.friends;
                console.log(userFriends);
                userFriends.forEach(function(user) {
                    var date = new Date(user.friend_since * 1000);
                    var year = date.getFullYear();
                    vm.pairKeyValue[year] = vm.pairKeyValue[year] + 1 || 1;
                    if (vm.labelsaux.indexOf(year) == -1) {
                        vm.labelsaux.push(year);
                      }
                })
                vm.labelsaux.sort();
                vm.dataaux.sort();
                vm.labels =   vm.labelsaux
                vm.pairKeyValue.forEach(function(value, key) {
                  vm.dataaux.push(value)
                })
                vm.data = vm.dataaux;

              })
              .catch(function(data) {

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
