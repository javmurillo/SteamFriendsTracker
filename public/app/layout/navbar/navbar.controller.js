(function() {
    'use strict';

    angular
        .module('app.layout.navbar')
        .controller('NavbarController', NavbarController);
    //LayoutController.$inject = ['logger'];

    function NavbarController($scope, $state, $http, $window) {
                  console.log("ey");
      $scope.login = function() {
          $window.location.href = '/auth/steam';
      }
    }
})();
