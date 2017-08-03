(function() {
    'use strict';

    angular
        .module('app.layout.footer')
        .directive('myFooter', footer);

      function footer() {
            var directive = {
              restrict: 'AE',
              replace: 'true',
              templateUrl: 'app/layout/footer/footer.html'
            };
            return directive;
        }
    })();
