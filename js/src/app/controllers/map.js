

function MapCtrl($rootScope, $scope, $route, $dialog, GoogleMaps) {

    var directionsService = new GoogleMaps.maps.DirectionsService();

    console.log("INIT MAP");

//    var mapsLoaded = function(){
//        console.log("map loaded");
//        directionsService = new google.maps.DirectionsService();
//        $scope.geocoder = new google.maps.Geocoder();
//        $scope.mapOptions = {
//            center: new google.maps.LatLng(51.5, -0.12),
//            zoom: 8,
//            mapTypeId: google.maps.MapTypeId.ROADMAP,
//            styles: flatStyle
//        };
//        $scope.Autocomplete = google.maps.places.Autocomplete;
//    };

//    google.load("maps", "3", {other_params:'sensor=false', nocss: true, callback : mapsLoaded});


    $scope.geocoder = new GoogleMaps.maps.Geocoder();
    $scope.mapOptions = {
        center: new GoogleMaps.maps.LatLng(51.5, -0.12),
        zoom: 8,
        mapTypeId: GoogleMaps.maps.MapTypeId.ROADMAP,
        styles: flatStyle
    };
    $scope.Autocomplete = GoogleMaps.maps.places.Autocomplete;

    // Inlined template for demo
    var t = '<div class="modal-header">' +
        '<h1>This is the title</h1>' +
        '</div>' +
        '<div class="modal-body">' +
        '<p>Enter a value to pass to <code>close</code> as the result: <input ng-model="result" /></p>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button ng-click="close(result)" class="btn btn-primary" >Close</button>' +
        '</div>';

    $scope.opts = {
        backdrop: true,
        keyboard: true,
        backdropClick: true,
        template: t
    };

    var d = $dialog.dialog($scope.opts);

    var startProgress = function () {
        d.open().then(function (result) {
            console.log('ok');
        });
    };

    var endProgress = function () {
        d.close();
    };

    var flatStyle = [
        {
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "color": "#ffffff"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "color": "#fee379"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "color": "#fee379"
                }
            ]
        },
        {
            "featureType": "landscape",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "color": "#f3f4f4"
                }
            ]
        },
        {
            "featureType": "water",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "color": "#7fc8ed"
                }
            ]
        },
        {},
        {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "color": "#83cead"
                }
            ]
        },
        {
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "landscape.man_made",
            "elementType": "geometry",
            "stylers": [
                {
                    "weight": 0.9
                },
                {
                    "visibility": "off"
                }
            ]
        }
    ];

    var myStyle = [
        {
            "featureType": "poi",
            "stylers": [
                { "color": "#ff0000" },
                { "visibility": "off" }
            ]
        },
        {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [
                { "saturation": -100 }
            ]
        },
        {
            "featureType": "transit",
            "stylers": [
                { "visibility": "off" }
            ]
        },
        {
        },
        {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [
                { "visibility": "on" },
                { "saturation": -59 }
            ]
        }
    ];


    function initialize() {
//        var from = /** @type {HTMLInputElement} */(document.getElementById('from'));
//        var autocompleteFrom = new google.maps.places.Autocomplete(from);
//
//        var to = /** @type {HTMLInputElement} */(document.getElementById('to'));
//        var autocompleteFrom = new google.maps.places.Autocomplete(to);
//        autocomplete.bindTo('bounds', $scope.MyMap);
    }

    $scope.$on('$routeChangeSuccess', function (scope, next, current) {
        if (next.$$route.activetab === 'quote') {
            angular.element(document.getElementById('quote_page')).css('display', 'block');
            if ($scope['MyMap']) {
                var map = $scope['MyMap'];
                GoogleMaps.maps.event.trigger(map, 'resize');
                map.setCenter(map.getCenter());
            }
        } else {
            angular.element(document.getElementById('quote_page')).css('display', 'none');
        }
    });


    function calcRoute(start, end, vias) {
        if(!start.address || !end.address){
            throw "unknow addess";
        }

        if($scope.directionsDisplay){
            $scope.directionsDisplay.setMap(null);
        }
        //startProgress();
        console.log(start, end);
        var request = {
            origin: start.address.geometry.location,
            destination: end.address.geometry.location,
            travelMode: GoogleMaps.maps.DirectionsTravelMode.DRIVING,
            waypoints: _(vias).pluck('point').pluck('address').compact().map(function (address) {
                return {
                    location: address.geometry.location,
                    stopover: true
                };
            }).value()
        };
        directionsService.route(request, function (response, status) {
            if (status == GoogleMaps.maps.DirectionsStatus.OK) {
                var res = _(response.routes[0].legs).reduce(function (acc, leg) {
                    acc.distance = acc.distance + leg.distance.value;
                    acc.duration = acc.duration + leg.duration.value;
                    return acc;
                }, {distance: 0, duration: 0});
                $scope.distance = res.distance;
                $scope.duration = res.duration;
                $scope.cost = res.duration / (180);
                if ($scope.directionsDisplay) {
                    $scope.directionsDisplay.setMap(null);
                }
                $scope.directionsDisplay = new GoogleMaps.maps.DirectionsRenderer();
                $scope.directionsDisplay.setDirections(response);
                $scope.directionsDisplay.setMap($scope.MyMap);
                $scope.info.status = 'result';
            } else {
                $scope.info.status = 'error';
                $scope.info.message = 'No route found';
            }
            //endProgress();
        });
    }

    $scope.map = {
        map: null
    };
    $scope.info = {

    };
    $scope.route = {
        vias: [

        ]
    };

//    $scope.$watch('route.vias', function(vias) {
//        console.log(arguments);
//        var idx = 0;
//        var group = [];
//        $scope.route.display_vias = _(vias).reduce(function(acc, via){
//            if(idx>3){
//                idx = 0;
//                group = [];
//                acc.push(group);
//            }
//            idx = idx + 1;
//            group.push(via);
//            return acc;
//        }, [group]);
//    }, true);

    $scope.addViaPoint = function () {
        _($scope.route.vias).each(function (via) {
            via.focus = false;
        });
        $scope.route.vias.push({focus: true});
    };

    $scope.deleteViaPoint = function (idx) {
        $scope.route.vias.splice(idx, 1);
    };


    $scope.calculateRoute = function () {
        console.log($scope.route);
        calcRoute($scope.route.origin, $scope.route.destination, $scope.route.vias);
    };

    var initialized = false;
    $scope.onIdle = function (e) {
        if (!initialized) {
            initialized = true;
            initialize();
        }
    };

    $scope.onClick = function (e) {
        console.log("XXXX", e);
    };


// var directionsDisplay;

// var directionsService = new google.maps.DirectionsService();
// var map;

// function initialize() {
//   directionsDisplay = new google.maps.DirectionsRenderer();
//   var chicago = new google.maps.LatLng(41.850033, -87.6500523);
//   var mapOptions = {
//     zoom: 7,
//     mapTypeId: google.maps.MapTypeId.ROADMAP,
//     center: chicago
//   }
//   map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
//   directionsDisplay.setMap(map);
// }

// function calcRoute() {
//   var start = document.getElementById('start').value;
//   var end = document.getElementById('end').value;
//   var request = {
//     origin: start,
//     destination: end,
//     travelMode: google.maps.DirectionsTravelMode.DRIVING
//   };
//   directionsService.route(request, function(response, status) {
//     if (status == google.maps.DirectionsStatus.OK) {
//       directionsDisplay.setDirections(response);
//     }
//   });
// }

}