(function() {
    'use strict';

    angular
        .module('app.layout')
        .factory('LoginService', LoginService);

    function LoginService($http, $window) {
        var vm = this;
        vm.user = null;
        var promise = $http.get("/api/identity").then(
            function(response) { //success
                console.log("User logged in.");
                vm.user = response.data;
            },
            function(response) { //error
                console.log("User not logged in.");
            }
        );

        var service = {
            promise: promise,
            loginRedirect: loginRedirect,
            logoutRedirect: logoutRedirect,
            isLogged: isLogged,
            userLogged: userLogged
        };

        return service;

        function loginRedirect() {
            $window.location.href = '/auth/steam';
        }
        function logoutRedirect() {
            $window.location.href = '/logout';
        }

        function isLogged() {
            return vm.user != undefined;
        }

        function userLogged() {
            return vm.user;
        }
    }
})();
