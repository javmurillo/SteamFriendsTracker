(function() {
    'use strict';

    angular
        .module('app.friendslist')
        .controller('FriendslistController', FriendslistController);

    FriendslistController.inject = ['$http', 'LoginService', 'FriendsService'];

    function FriendslistController($http, LoginService, ProfilesService) {
        var vm = this;

        vm.isLogged = isLogged;
        vm.userLogged = userLogged;
        vm.getDateByTimestamp = getDateByTimestamp;
        vm.firstHalfProfiles = {};
        vm.secondHalfProfiles = {};

        vm.user = userLogged();

        ProfilesService.getUserFriendslist(vm.user.steamid).then(function(response) {
            vm.friendslist = response.data.friendslist.friends;
            console.log(vm.friendslist);
            vm.users = {}
            var i = 0;
            vm.friendslist.forEach(function(user) {
                ProfilesService.getFriendProfile(user.steamid).then(function(response) {
                    vm.users[i] = response.data.response.players[0];
                    vm.users[i]['friendSince'] = user.friend_since;
                    i++;
                });
            });

        });

        function chunk(arr, size) {
            var newArr = [];
            for (var i=0; i<arr.length; i+=size) {
              newArr.push(arr.slice(i, i+size));
            }
            return newArr;
        }


        function getDateByTimestamp(timestamp) {
            return ProfilesService.getDateByTimestamp(timestamp);
        }

        function isLogged() {
            return LoginService.isLogged();
        }

        function userLogged() {
            return LoginService.userLogged();
        }


    }
})();
