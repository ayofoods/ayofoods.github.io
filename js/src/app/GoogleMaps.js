angular.module('GoogleMaps', []).factory('GoogleMapsApi', function($q, $rootScope){

    // from https://developers.google.com/maps/documentation/javascript/examples/map-simple-async
    var deferred = $q.defer();
    

    window.initialize = function() {
      //$rootScope.$apply(function(){
        deferred.resolve({maps: google.maps});
      //});
      $rootScope.$digest();
    };

    function loadScript() {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=places&' +
          'callback=initialize';
      document.body.appendChild(script);
    }

    window.onload = loadScript;
    
    return deferred.promise;

});