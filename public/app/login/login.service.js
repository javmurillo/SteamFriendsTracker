(function() {
    'use strict';

    angular
        .module('app.login')
        .factory('LoginService', LoginService);

    function LoginService($http, $window) {
        console.log("LoginService called")
        var vm = this;
        vm.user = null;

        var service = {
            getIdentity: getIdentity,
            loginRedirect: loginRedirect,
            logoutRedirect: logoutRedirect,
            isLogged: isLogged,
            userLogged: userLogged
        };

        return service;

        function getIdentity() {
            return $http.get("/api/identity").then(function(response) {
              console.log("GET api/identity - User variable updated.")
                return vm.user = response.data;
            })
            .catch(function(data) {
              return vm.internalError = true;
            });
        }

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
