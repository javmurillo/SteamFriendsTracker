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
            var i = 0;

            if (vm.user.historical.addedFriends.length < 1 && vm.user.historical.deletedFriends <1) {
              vm.emptyArrays = true;
            }
            else {
              var promises = [];
               vm.user.historical.addedFriends.forEach(function(user) {
                   promises.push(ProfilesService.getFriendProfile(user.steamid));
                   vm.friendSinceArray[i] = new Date(getDateByTimestamp(user.friend_since));
                   i++;
               })
               var i = 0;
               $q.all(promises).then(function(response) {
                 response.forEach(function(response) {
                   vm.addedProfiles[i] = response.data.response.players[0];
                   vm.addedProfiles[i]['friendsSince'] = vm.friendSinceArray[i]
                   i++;
                 })
                 vm.addedFriendsTable = new NgTableParams({count: 10}, {dataset: vm.addedProfiles, counts: [5, 10, 20]});
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
                          vm.deletedProfiles[i] = response.data.response.players[0];
                          vm.deletedProfiles[i]['friendSince'] = user.friend_since;
                          i++;
                      })
                      .catch(function(data) {
                          vm.internalError = true;
                      });
              });

              console.log(vm.addedProfiles);

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
