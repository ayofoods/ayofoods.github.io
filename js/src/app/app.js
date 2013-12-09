angular.module( 'cabmini', [
  'firebase',
  'ui.mask'//,
  //'templates-app',
  //'templates-common',
  //'ngBoilerplate.home',
  //'ngBoilerplate.about',
  //'ui.state',
  //'ui.route'//,
  //'GoogleMaps',
  //'GoogleMapsPlaces'
])


// .config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
//   $urlRouterProvider.otherwise( '/home' );
// })

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $http, angularFire, angularFireAuth, angularFireCollection, $location /*, GoogleMapsApi */) {

  $scope.basket = {};

  var ref = new Firebase("https://ayofoods.firebaseio.com/");
  angularFireAuth.initialize(ref, {scope: $scope, name: "user"});


  var bla = angularFireCollection(new Firebase("https://ayofoods.firebaseio.com/inventory"), function(a, b, c){
    console.log(a,b, c);
  });
  var inventory = new Firebase("https://ayofoods.firebaseio.com/inventory");
  angularFire(inventory, $scope, 'items');  

  // $http.get('/ayofoods-export.json').success(function(data) {
  //   $scope.items = _.values(data.inventory);
  // });



  $scope.login = function() {
    angularFireAuth.login('password', {
      email: $scope.email,
      password: $scope.password,
      rememberMe: true
    });    
  };

  $scope.active = "meat";

  $scope.place_order = function() {
    var ref = new Firebase("https://ayofoods.firebaseio.com/users/orders");
    ref = ref.child($scope.user.id).child('orders');
    var order = ref.push();
    $scope.basket.date = Date();
    order.set(angular.copy($scope.basket));   
    $scope.basket = {};

    $('#order_sent').modal('show');
  };

  $scope.$on("angularFireAuth:login", function(evt, user) {
    $scope.user = user;
    $scope.auth_error = null;
    $('#login, #signup').modal('hide');
    console.log('User logged in.');
  });
  $scope.$on("angularFireAuth:logout", function(evt) {
    $scope.auth_error = null;
    console.log('User logged out.');
  });
  $scope.$on("angularFireAuth:error", function(evt, err) {
    $scope.auth_error = err.message;
    console.log('There was an error during authentication.');
  });


  $scope.logout = function() {
    angularFireAuth.logout();
  };

  $scope.signup = function() {
    angularFireAuth.createUser($scope.email, $scope.password);
  };


  $scope.format_money = function(money){
    return ("" + money).replace(/(.*)(.{2})/g, "$1.$2");
  };

  $scope.format_money_a = function(qty, price){
    return $scope.format_money(100 * price * qty);
  };

  $scope.total_basket = function(){
    return $scope.format_money(_.reduce($scope.basket, function(acc, item){
      return acc + item.qty * item.price * 100;
    }, 0));
  };


  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | ngBoilerplate' ;
    }
  });


  $scope.incX = function(item) {
    $scope.basket = $scope.basket || {};
    $scope.basket[item.id] = $scope.basket[item.id] || {};
    var qty = $scope.basket[item.id].qty || 0;
    $scope.basket[item.id] = item;
    $scope.basket[item.id].qty = qty + 1;
  };

  $scope.decX = function(id) {
    $scope.basket = $scope.basket || {};
    $scope.basket[item.id] = $scope.basket[item.id] || {};
    var qty = $scope.basket[item.id].qty || 0;
    $scope.basket[item.id] = item;
    if($scope.basket[item.id].qty > 0){
      $scope.basket[item.id].qty = qty - 1;
    }
  };

  // GoogleMapsApi.then(
  //   function(google) {
  //     google.maps.visualRefresh = true;
  //     var mapOptions = {
  //       scrollwheel: false,
  //       panControl: false,
  //       zoomControl: false,
  //       mapTypeControl: false,
  //       scaleControl: false,
  //       streetViewControl: false,
  //       overviewMapControl: false,  
  //       disableDefaultUI: true,
  //       disableDoubleClickZoom: true,
  //       draggable: false,
  //       keyboardShortcuts: false,
  //       mapTypeId: google.maps.MapTypeId.SATELLITE,
  //       tilt: 45,
  //       zoom: 3,
  //       center: new google.maps.LatLng(0, 25),
  //       styles: [
  //         // {
  //         //   "featureType": "landscape",
  //         //   "elementType": "geometry",
  //         //   "stylers": [
  //         //     { "visibility": "off" }
  //         //   ]
  //         // },{
  //         //   "featureType": "poi",
  //         //   "stylers": [
  //         //     { "visibility": "off" }
  //         //   ]
  //         // },{
  //         //   "featureType": "water",
  //         //   "stylers": [
  //         //     { "visibility": "on" },
  //         //     { "lightness": -88 }
  //         //   ]
  //         // },{
  //         //   "featureType": "road.local",
  //         //   "stylers": [
  //         //     { "lightness": -72 }
  //         //   ]
  //         // },{
  //         //   "featureType": "road.arterial",
  //         //   "stylers": [
  //         //     { "lightness": -74 },
  //         //     { "color": "#f38080" },
  //         //     { "weight": 0.6 }
  //         //   ]
  //         // },{
  //         //   "featureType": "road.highway",
  //         //   "stylers": [
  //         //     { "lightness": 34 },
  //         //     { "color": "#ffffff" }
  //         //   ]
  //         // }
  //       ]
  //     };
  //     $scope.MyMap = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  //   }, 
  //   function(reason) {
  //     alert('Failed: ' + reason);
  //   }, 
  //   function(update) {
  //     alert('Got notification: ' + update);
  //   });

  
  
});

$('.selectpicker').selectpicker();


jQuery('.tooltip').on('mouseover', function(){
    // may need to check here if it already has a tooltip (depending on plugin)
  //   jQuery(this).tooltip({ 
  //      effect: 'slide',
  //      offset: [10, 570],
  //      predelay: 100, 
  //      position: "bottom left"}).dynamic( { 
  //          bottom: { 
  //          direction: 'down', 
  //          bounce: true 
  //      } 
  // }); 
  console.log("tooltip");
});

