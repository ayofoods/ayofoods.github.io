  function pacSelectFirst(input) {
        // store the original event binding function
        var _addEventListener = (input.addEventListener) ? input.addEventListener : input.attachEvent;

        function addEventListenerWrapper(type, listener) {
            // Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected,
            // and then trigger the original listener.
            if (type == "keydown") {
                var orig_listener = listener;
                listener = function (event) {
                    var suggestion_selected = $(".pac-item.pac-selected").length > 0;
                    if ((event.which == 13 || event.which == 9) && !suggestion_selected) {
                        var simulated_downarrow = $.Event("keydown", {
                            keyCode: 40,
                            which: 40
                        });
                        orig_listener.apply(input, [simulated_downarrow]);
                    }

                    orig_listener.apply(input, [event]);
                };
            }

            _addEventListener.apply(input, [type, listener]);
        }

        input.addEventListener = addEventListenerWrapper;
        input.attachEvent = addEventListenerWrapper;

    }

/* Directives */
angular.module('GoogleMapsPlaces', ['GoogleMaps']).directive('autocomplete', 




    function (GoogleMapsApi) {
      
            return {

                restrict: "A",
                require: 'ngModel',
                link: function (scope, element, attrs, ngModel) {
                    //var geocoder = scope.geocoder;
                    if (!ngModel) {
                        console.error("no ngModel!");
                        return;
                    } // do nothing if no ng-model

                    attrs.$observe('focus', function (focus) {
                        if(focus === 'true'){
                            element[0].focus();
                        }
                    });

                    // Specify how UI should be updated
                    ngModel.$render = function () {
                        element.html(ngModel.$viewValue.text || '');
                    };

                    // Listen for change events to enable binding
                    element.bind('change', function () {
                        scope.$apply(read);
                    });

                    element.bind('focus click', function () {
                        //element.removeClass('error');
                    });

                    element.bind('blur keyup', function (e) {
                        if (e.type === 'blur' || (e.type === 'keyup' && e.keyCode === 13 /* enter */ )){
                            if (!ngModel.$viewValue.address && element.val() !== "") {
                                // nie rozstrzygnięty adres, geokodujemy to co zostało wprowadzone

                                GoogleMapsApi.then(
                                  function(google) {
                                  var geocoder = new google.maps.Geocoder();
                                  geocoder.geocode({ 'address': element.val(), bounds: scope[attrs.autocomplete].getBounds()}, function (results, status) {
                                      if (status === google.maps.GeocoderStatus.OK) {
                                          scope.$apply(function () {
                                              ngModel.$setValidity('addres', true);
                                              element.val(results[0].formatted_address);
                                              ngModel.$setViewValue({text: results[0].formatted_address, address: results[0]});
                                          });
                                      } else {
                                          // Inform the user that a place was not found and return.
                                          scope.$apply(read);
                                          scope.$apply(function () {
                                              ngModel.$setValidity('addres', false);
                                          });
                                          console.error('Geocode was not successful for the following reason: ' + status);
                                      }
                                  });
                                });
                            }
                          }
                    });
                    read(); // initialize

                    // Write data to the model
                    function read() {
                        if (element.val() !== ngModel.$viewValue.text){
                          ngModel.$setViewValue({text: element.val()});
                        }
                    }

                    var options = {
                        //types: ['establishment', '(cities)', 'postal_code']
                    };

                    pacSelectFirst(element[0]);

                    GoogleMapsApi.then(function(google) {
                      var geocoder = new google.maps.Geocoder();

                      var autocomplete = new google.maps.places.Autocomplete(element[0], options);

                      //var autocomplete = pacSelectFirst(element[0], options);

                      scope.$watch(function (sc) {
                          return sc[attrs.autocomplete];
                      }, function (map) {
                          if (map) {
                              autocomplete.bindTo('bounds', map);
                          }
                      });

                      google.maps.event.addListener(autocomplete, 'place_changed', function () {
                          var place = autocomplete.getPlace();
                          if (!place.geometry) {

                                geocoder.geocode({ 'address': place.name}, function (results, status) {
                                    if (status === google.maps.GeocoderStatus.OK) {
                                        scope.$apply(function () {
                                            ngModel.$setValidity('addres', true);
                                            element.val(results[0].formatted_address);
                                            ngModel.$setViewValue({text: results[0].formatted_address, address: results[0]});
                                        });
                                    } else {
                                        // Inform the user that a place was not found and return.
                                        scope.$apply(function () {
                                            ngModel.$setValidity('addres', false);
                                        });
                                        console.error('Geocode was not successful for the following reason: ' + status);
                                    }
                              });
                          } else {
                              scope.$apply(function () {
                                  ngModel.$setValidity('addres', true);
                                  //
                                  var viewValue = angular.extend(ngModel.$viewValue, {address: place});
                                  ngModel.$setViewValue(viewValue);
                              });
                              console.log("location: ", place.geometry.location);
                          }
                      });
                    });
                }
            };
         
    }
);