(function() {
    'use strict';

    angular
        .module('app.layout')
        .factory('LoginService', LoginService);

    function LoginService($http, $window) {
        var vm = this;

        var promise = $http.get("/api/identity").then(
            function(response) { //success
                console.log("User logged in.");
                vm.user = response.data;
                console.log(vm.user);

            },
            function(response) { //error
                console.log("User not logged in.");
            }
        );

        var service = {
            promise: promise,
            loginRedirect: loginRedirect,
            isLogged: isLogged,
            userLogged: userLogged
        };

        return service;

        function loginRedirect() {
            $window.location.href = '/auth/steam';
        }

        function isLogged() {
            return vm.user != undefined;
        }

        function userLogged() {
            return vm.user;
        }
    }
})();
