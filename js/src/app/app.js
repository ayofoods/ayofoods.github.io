angular.module( 'cabmini', [
  'firebase',
  'directives.datatable',
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

.controller( 'AppCtrl', function AppCtrl ( $compile, $scope, $http, angularFire, angularFireAuth, angularFireCollection, $location) {

  $( document ).on( "focus", "#table_filter input", function(){
    $scope.category = "all";
    $scope.$digest();
  });

  $scope.basket = {};

  var money = function(amount){
    return (""+amount).replace(/^([0-9]*)([0-9][0-9]).*$/g, "$1.$2");
  };

  $scope.money = money;

  var ref = new Firebase("https://ijeshop.firebaseio.com/");
  var auth = new FirebaseSimpleLogin(ref, function(error, user) {
    if(!error){
      $scope.$apply(function(){
        $scope.user = user;
      });
    }
  });

  //angularFireAuth.initialize(ref, {scope: $scope, name: "user"});
  auth.login('anonymous');

  angularFireCollection(new Firebase("https://ijeshop.firebaseio.com/inventory"), function(data){
    //$scope.all_items = _.filter(data.val(), function(i){ return i.price; });
    $scope.all_items = _.filter(_.map(data.val(), function(i){
      i.price = parseFloat((i.price || 0), 10);
      return i;
    }), function(i){
      return i.price > 0;
    });

    $scope.categories = _.reduce($scope.all_items, function(acc, i){
      acc[i.category] = acc[i.category] || [];
      acc[i.category].push(i);
      return acc;
    }, {});
    $scope.category = "meat";

    // oTable.fnFilter('');

    $scope.items = function(){
      var oTable = $('#table').dataTable();          
      if($scope.category === "all"){
        return $scope.all_items;
      }else{
        return $scope.categories[$scope.category];
      }
    };

    $scope.items_index = _.reduce($scope.all_items, function(acc, i){
      acc[i.id] = i;
      return acc;
    }, {});
  });
  //angularFire(inventory, $scope, 'items');  

  // $http.get('/ayofoods-export.json').success(function(data) {
  //   $scope.items = _.values(data.inventory);
  // });

  $scope.active = "meat";

  $scope.place_order = function() {
    var ref = new Firebase("https://ijeshop.firebaseio.com/users");
    var user = ref.child($scope.user.id);
    var orders = user.child('orders');
    var order = orders.push();
    var items = order.child('items');
    var meta = order.child('meta');
    
    items.set(angular.copy($scope.basket));
    meta.set({total: $scope.total_basket()/100, delivery_name: angular.copy($scope.delivery_name) || '', delivery_postcode: angular.copy($scope.delivery_postcode) || '', delivery_address: angular.copy($scope.delivery_address) || '', date: Firebase.ServerValue.TIMESTAMP, delivery_email: angular.copy($scope.delivery_email) || '', delivery_telephone: angular.copy($scope.delivery_telephone) || ''});
    $scope.to_pay = 699+$scope.total_basket();

    $scope.basket = {};

    $http.jsonp("https://script.google.com/macros/s/AKfycbx0w0dw47Cx3zcSGLoLmXW4eCPL-oXSv3EVHT3kuECIbtLHsdiX/exec?userid="+$scope.user.id+"&orderid="+order.name());

    $('#place_order').modal('hide');
    $('#order_sent').modal('show');
  };

  $scope.$on("angularFireAuth:login", function(evt, user) {
    $scope.user = user;
    $scope.auth_error = null;
    // $('#login, #signup').modal('hide');
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


  $scope.minimal_order = function(){
    return 49.99 <= _.reduce($scope.basket, function(acc, i){
      return acc + (i.price * i.qty);
    }, 0);
  };

  $scope.logout = function() {
    angularFireAuth.logout();
  };

  $scope.signup = function() {
    var name = $scope.signup_name;
    angularFireAuth.createUser($scope.signup_email, $scope.signup_password);
    // angularFireAuth.createUser($scope.signup_email, $scope.signup_password, function(error, user) {
    //   if (!error) {
    //     console.log('User Id: ' + user.id + ', Email: ' + user.email);
    //     var ref = new Firebase("https://ijeshop.firebaseio.com/users");
    //     var name = ref.child($scope.user.id).child('name');
    //     name.set($scope.signup_name);
    //   }
    // });
  };

  $scope.total_basket = function(){
    return _.reduce($scope.basket, function(acc, item){
      return acc + item.qty * (100 * item.price);
    }, 0);
  };


  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | ngBoilerplate' ;
    }
  });


  $scope.incX = function(id) {
    var item = $scope.items_index[id];
    $scope.basket = $scope.basket || {};
    $scope.basket[item.id] = $scope.basket[item.id] || {};
    var qty = $scope.basket[item.id].qty || 0;
    $scope.basket[item.id] = item;
    $scope.basket[item.id].qty = qty + 1;
  };

  $scope.decX = function(id) {
    var item = $scope.items_index[id];
    $scope.basket = $scope.basket || {};
    $scope.basket[item.id] = $scope.basket[item.id] || {};
    var qty = $scope.basket[item.id].qty || 0;
    $scope.basket[item.id] = item;
    if($scope.basket[item.id].qty > 0){
      $scope.basket[item.id].qty = qty - 1;
    }
    if($scope.basket[item.id].qty<=0){
      delete $scope.basket[item.id];
    }
  };

  $.fn.dataTableExt.sErrMode = 'throw';

  $scope.tblColumns = [

    {
      sTitle: "",
      //mData: ".",
      mData: function (source, type, val) {
        return source;
      },
      mRender: function (item) {
        return '<img src="'+item.flickr+'" width="120">';
      }
    },
    {
      sTitle: "Description",
      //mData: ".",
      mData: function (source, type, val) {
        return source;
      },
      mRender: function (item) {
        return item.desc || '';
      }
    },    
    {
      sTitle: "Weight",
      //mData: ".",
      mData: function (source, type, val) {
        return source;
      },
      mRender: function (item) {
        return item.unit_kg || '';
      }

    },
    {
      sTitle: "Price",
      //mData: ".",
      mData: function (source, type, val) {
        return source;
      },
      mRender: function (item) {
        return '£ '+money(100*item.price) || '';
      }

    },
    {
      sTitle: "In your basket",
      //mData: ".",
      mData: function (source, type, val) {
        return source;
      },
      mRender: function (item) {
        return '<strong ng-bind="basket[&apos;'+item.id+'&apos;].qty"></strong>'+
        '<a class="btn btn-primary pull-right" ng-click="decX(&apos;'+item.id+'&apos;)"><i class="fa fa-minus-circle"></i></a>'+
        '<span class="pull-right">&nbsp;</span>'+
        '<a class="btn btn-primary pull-right" ng-click="incX(&apos;'+item.id+'&apos;)"><i class="fa fa-plus-circle"></i></a>'
        ;
      }

    }    
  ];

  $scope.overrideOptions = {
    iDisplayLength: 100,
    "sDom": "<'row'<'col-xs-6'l><'col-xs-6'f>r>t<'row'<'col-xs-6'i><'col-xs-6'p>>",
    "sPaginationType": "bootstrap",
    "oLanguage": {
            "sLengthMenu": "_MENU_ records per page"
    },
    // sDom: "<'row-fluid'" +
    //     "  <'span6'l>" +
    //     "  <'span6'" +
    //     "    <'input-prepend'" +
    //     "      <'add-on'" +
    //     "        <'icon-search'>" +
    //     "      >" +
    //     "      f" +
    //     "    >" +
    //     "  r>" +
    //     "" +
    //     "    t" +
    //     "    <'row-fluid'" +
    //     "      <'span6'i>" +
    //     "      <'span6'p>>",
    // sPaginationType: "bootstrap",
    // oLanguage: {
    //   sSearch: ""
    // },
    fnCreatedRow: function (nRow, aData, iDataIndex) {
      //$(nRow).attr('ng-click', 'show("' + aData._id + '")');
      $compile(nRow)($scope);
    },
    fnRowCallbackX: function(nRow, b, c, d, e){
      // var nCell = document.createElement( 'div' );
      // nCell.innerHTML = b.desc;
      // a.insertBefore( nCell );

      $(nRow).html( '<b>A</b>' );
      //$( a ).insertAfter(nCell);
    },
    fnDrawCallback: function ( oSettings ) {
      if ( oSettings.aiDisplay.length === 0 )
      {
        return;
      }
      var nTrs = $('tbody tr', this);
      var iColspan = nTrs[0].getElementsByTagName('td').length;
      var j = 0;
      for ( var i=oSettings._iDisplayStart ; i<oSettings._iDisplayEnd ; i++ )
      {

        var data = oSettings.aoData[ oSettings.aiDisplay[i] ]._aData;        
          if(data.comment && data.comment.trim() !== ""){
          var nGroup = document.createElement( 'tr' );
          nGroup.className = "comment "+($(nTrs[j]).hasClass('odd') ? 'odd' : 'even');
          var nCell = document.createElement( 'td' );
          nCell.colSpan = iColspan;
          nCell.className = "comment";
          nCell.innerHTML = data.comment;
          nGroup.appendChild( nCell );

          // var parent = nTrs[j].parentNode;
          // if(parent.lastchild == nTrs[j]) {
          //   //add the newElement after the target element.
          //   parent.appendChild(nGroup);
          // } else {
          //   // else the target has siblings, insert the new element between the target and it's next sibling.
          //   parent.insertBefore(nGroup, nTrs[j].nextSibling);
          // } 
          $(nTrs[j]).after(nGroup);
        }
        j++;
      }
    }
  };
  
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








/* Set the defaults for DataTables initialisation */
$.extend( true, $.fn.dataTable.defaults, {
        "sDom": "<'row'<'col-xs-6'l><'col-xs-6'f>r>t<'row'<'col-xs-6'i><'col-xs-6'p>>",
        "sPaginationType": "bootstrap",
        "oLanguage": {
                "sLengthMenu": "_MENU_ records per page"
        }
} );




/* Default class modification */
$.extend( $.fn.dataTableExt.oStdClasses, {
        "sWrapper": "dataTables_wrapper form-inline",
        "sFilterInput": "form-control input-sm",
        "sLengthSelect": "form-control input-sm"
} );


/* API method to get paging information */
$.fn.dataTableExt.oApi.fnPagingInfo = function ( oSettings )
{
        return {
                "iStart":         oSettings._iDisplayStart,
                "iEnd":           oSettings.fnDisplayEnd(),
                "iLength":        oSettings._iDisplayLength,
                "iTotal":         oSettings.fnRecordsTotal(),
                "iFilteredTotal": oSettings.fnRecordsDisplay(),
                "iPage":          oSettings._iDisplayLength === -1 ?
                        0 : Math.ceil( oSettings._iDisplayStart / oSettings._iDisplayLength ),
                "iTotalPages":    oSettings._iDisplayLength === -1 ?
                        0 : Math.ceil( oSettings.fnRecordsDisplay() / oSettings._iDisplayLength )
        };
};


/* Bootstrap style pagination control */
$.extend( $.fn.dataTableExt.oPagination, {
        "bootstrap": {
                "fnInit": function( oSettings, nPaging, fnDraw ) {
                        var oLang = oSettings.oLanguage.oPaginate;
                        var fnClickHandler = function ( e ) {
                                e.preventDefault();
                                if ( oSettings.oApi._fnPageChange(oSettings, e.data.action) ) {
                                        fnDraw( oSettings );
                                }
                        };

                        $(nPaging).append(
                                '<ul class="pagination">'+
                                        '<li class="prev disabled"><a href="#">&larr; '+oLang.sPrevious+'</a></li>'+
                                        '<li class="next disabled"><a href="#">'+oLang.sNext+' &rarr; </a></li>'+
                                '</ul>'
                        );
                        var els = $('a', nPaging);
                        $(els[0]).bind( 'click.DT', { action: "previous" }, fnClickHandler );
                        $(els[1]).bind( 'click.DT', { action: "next" }, fnClickHandler );
                },

                "fnUpdate": function ( oSettings, fnDraw ) {
                        var iListLength = 5;
                        var oPaging = oSettings.oInstance.fnPagingInfo();
                        var an = oSettings.aanFeatures.p;
                        var i, ien, j, sClass, iStart, iEnd, iHalf=Math.floor(iListLength/2);

                        if ( oPaging.iTotalPages < iListLength) {
                                iStart = 1;
                                iEnd = oPaging.iTotalPages;
                        }
                        else if ( oPaging.iPage <= iHalf ) {
                                iStart = 1;
                                iEnd = iListLength;
                        } else if ( oPaging.iPage >= (oPaging.iTotalPages-iHalf) ) {
                                iStart = oPaging.iTotalPages - iListLength + 1;
                                iEnd = oPaging.iTotalPages;
                        } else {
                                iStart = oPaging.iPage - iHalf + 1;
                                iEnd = iStart + iListLength - 1;
                        }

                        for ( i=0, ien=an.length ; i<ien ; i++ ) {
                                // Remove the middle elements
                                $('li:gt(0)', an[i]).filter(':not(:last)').remove();

                                // Add the new list items and their event handlers
                                /*jshint -W083 */
                                for ( j=iStart ; j<=iEnd ; j++ ) {
                                        sClass = (j==oPaging.iPage+1) ? 'class="active"' : '';
                                        $('<li '+sClass+'><a href="#">'+j+'</a></li>')
                                                .insertBefore( $('li:last', an[i])[0] )
                                                .bind('click', function (e) {
                                                        e.preventDefault();
                                                        oSettings._iDisplayStart = (parseInt($('a', this).text(),10)-1) * oPaging.iLength;
                                                        fnDraw( oSettings );
                                                });
                                }

                                // Add / remove disabled classes from the static elements
                                if ( oPaging.iPage === 0 ) {
                                        $('li:first', an[i]).addClass('disabled');
                                } else {
                                        $('li:first', an[i]).removeClass('disabled');
                                }

                                if ( oPaging.iPage === oPaging.iTotalPages-1 || oPaging.iTotalPages === 0 ) {
                                        $('li:last', an[i]).addClass('disabled');
                                } else {
                                        $('li:last', an[i]).removeClass('disabled');
                                }
                        }
                }
        }
} );


/*
 * TableTools Bootstrap compatibility
 * Required TableTools 2.1+
 */
if ( $.fn.DataTable.TableTools ) {
        // Set the classes that TableTools uses to something suitable for Bootstrap
        $.extend( true, $.fn.DataTable.TableTools.classes, {
                "container": "DTTT btn-group",
                "buttons": {
                        "normal": "btn btn-default",
                        "disabled": "disabled"
                },
                "collection": {
                        "container": "DTTT_dropdown dropdown-menu",
                        "buttons": {
                                "normal": "",
                                "disabled": "disabled"
                        }
                },
                "print": {
                        "info": "DTTT_print_info modal"
                },
                "select": {
                        "row": "active"
                }
        } );

        // Have the collection use a bootstrap compatible dropdown
        $.extend( true, $.fn.DataTable.TableTools.DEFAULTS.oTags, {
                "collection": {
                        "container": "ul",
                        "button": "li",
                        "liner": "a"
                }
        } );
}

