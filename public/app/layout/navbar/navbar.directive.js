(function() {
    'use strict';

    angular
        .module('app.layout.navbar')
        .directive('navbar', navbar);

    function navbar() {
        var directive = {
            bindToController: true,
            controller: NavbarController,
            controllerAs: 'vm',
            restrict: 'EA',
            scope: {
                'navline': '='
            },
            templateUrl: 'app/layout/navbar/navbar.html'
        };

        NavbarController.$inject = ['LoginService'];

        function NavbarController(LoginService) {
            //console.log("Navbar controller called!");
            var vm = this;

            vm.loginRedirect = loginRedirect;
            vm.logoutRedirect = logoutRedirect;
            vm.isLogged = isLogged;
            vm.userLogged = userLogged;

            if (isLogged()) {
                vm.user = userLogged();
            }

            function loginRedirect() {
                return LoginService.loginRedirect();
            }

            function logoutRedirect() {
                return LoginService.logoutRedirect();
            }

            function isLogged() {
                return LoginService.isLogged();
            }

            function userLogged() {
                return LoginService.userLogged();
            }
        }
        return directive;
    }
})();
