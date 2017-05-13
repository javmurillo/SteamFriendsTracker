(function() {
    'use strict';

    angular
        .module('app.home')
        .controller('HomeController', HomeController);

    HomeController.inject = ['LoginService'];

    function HomeController(LoginService) {
      var vm = this;
      vm.isLogged = isLogged;

      function isLogged() {
          return LoginService.isLogged();
      }

    }
})();
