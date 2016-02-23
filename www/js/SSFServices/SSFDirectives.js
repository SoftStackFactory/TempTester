/* Can break the app if ionic updates this directive
Instructions:
1.  Inject 'SSFDirectives' into the app.js file.
2.  Place '<script src="js/SSFServices/SSFDirectives.js"></script>' into the index.html
            file above the app.js
3.  include the following div in the index.html
    <div resize="" ng-app="starter" style="height:100%;" ng-style="style()">
      <ion-nav-bar></ion-nav-bar>
      <ion-nav-view></ion-nav-view>
    </div>
4.  For an app without a side menu, you do not need the second directive in this file
      called 'ionSideMenuContent'.
5.  If you have not already, include the 'SSFConfig.js' file.
6.  Include the follow '.config([...})' block of code in the SSFConfig.js file.
    .config(['SSFConfigConstants', function(SSFConfigConstants) {
      SSFConfigConstants['SSFDirectives'] = {
        'contentWidth': 900
      };
    }])
7.  If you are making an app with a side menu, continue on to step 8. Otherwise, you have
            finsihed setting up the directives file.
8.  Go into your menu.html file and include this:
            ' expose-aside-when="{{minWidth}}"' inside the:
            '<ion-side-menu side="left">''
            so it looks like:
            '<ion-side-menu side="left" expose-aside-when="{{minWidth}}">'
9.  Go into your menu.html's controller and include this:
            '$scope.minWidth = "(min-width:" + SSFConfigConstants.SSFDirectives.contentWidth +"px)";'
*/


angular.module('SSFDirectives', [])
// .constant('CONTENT_WIDTH', 900)
.directive('resize', ["$window", "SSFConfigConstants", '$rootScope',
        function ($window, SSFConfigConstants, $rootScope) {
    
    return function (scope, element) {
        scope.$watch($window.innerWidth, function (newValue, oldValue) {        
            scope.style = function () {
                var newWidth;        
                if($window.innerWidth < SSFConfigConstants.SSFDirectives.contentWidth) {
                    newWidth = {
                        'width': "",
                        'position': "",
                        "transform": "",
                        'left': ''
                    };
                }
                else if(!ionic.Platform.isWebView()){
                    newWidth = {
                        'width': SSFConfigConstants.SSFDirectives.contentWidth + "px",
                        'position': "fixed",
                        'transform': "translateX(-50%)",
                        'left':'50%'
                    };
                }
                return newWidth;
            };
        }, true);
        angular.element($window).bind('resize', function () {
            scope.$apply();
        });
    };
}])

// .directive('ionSideMenuContent', [
//   '$timeout',
//   '$ionicGesture',
//   '$window',
//   'SSFConfigConstants',
// function($timeout, $ionicGesture, $window, SSFConfigConstants) {
//     return {
//     require: '^ionSideMenus',
//     compile: function(element, $attributes) {
//         if(ionic.Platform.isWebView())
//           return { pre: prelink };
//         else 
//           return { pre: customPrelink };

//         function customPrelink($scope, $element, $attr, sideMenuCtrl) {
//             var content = {
//               element: element[0],
//               onDrag: function() {},
//               endDrag: function() {},
//               setCanScroll: function(canScroll) {
//               var c = $element[0].querySelector('.scroll');
    
//                 if (!c) {
//                   return;
//                 }
    
//                 var content = angular.element(c.parentElement);
//                 if (!content) {
//                   return;
//                 }
    
//                 // freeze our scroll container if we have one
//                 var scrollScope = content.scope();
//                 scrollScope.scrollCtrl && scrollScope.scrollCtrl.freezeScrollShut(!canScroll);
//               },
//               getTranslateX: function() {
//                 return $scope.sideMenuContentTranslateX || 0;
//               },
//               setTranslateX: ionic.animationFrameThrottle(function(amount) {
//                 var xTransform = content.offsetX + amount;
//                 $element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(' + xTransform + 'px,0,0)';
//                 $timeout(function() {
//                   $scope.sideMenuContentTranslateX = amount;
//                 });
//               }),
//               setMarginLeft: ionic.animationFrameThrottle(function(amount) {
//                 if (amount) {
                   
//                   amount = parseInt(amount, 10);
//                   $element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(' + amount + 'px,0,0)';
//                   $element[0].style.width = (SSFConfigConstants.SSFDirectives.contentWidth - amount) + 'px';
//                   content.offsetX = amount;
//                 } else {
//                   $element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(0,0,0)';
//                   $element[0].style.width = '';
//                   content.offsetX = 0;
//                 }
//               }),
//               setMarginRight: ionic.animationFrameThrottle(function(amount) {
//                 if (amount) {
//                   amount = parseInt(amount, 10);
//                   $element[0].style.width = (SSFConfigConstants.SSFDirectives.contentWidth - amount) + 'px';
//                   content.offsetX = amount;
//                 } else {
//                   $element[0].style.width = '';
//                   content.offsetX = 0;
//                 }
//                 // reset incase left gets grabby
//                 $element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(0,0,0)';
//               }),
//               setMarginLeftAndRight: ionic.animationFrameThrottle(function(amountLeft, amountRight) {
//                 amountLeft = amountLeft && parseInt(amountLeft, 10) || 0;
//                 amountRight = amountRight && parseInt(amountRight, 10) || 0;
    
//                 var amount = amountLeft + amountRight;
    
//                 if (amount > 0) {
//                   $element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(' + amountLeft + 'px,0,0)';
//                   $element[0].style.width = ($window.innerWidth - amount) + 'px';
//                   content.offsetX = amountLeft;
//                 } else {
//                   $element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(0,0,0)';
//                   $element[0].style.width = '';
//                   content.offsetX = 0;
//                 }
//                 // reset incase left gets grabby
//                 //$element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(0,0,0)';
//               }),
//               enableAnimation: function() {
//                 $scope.animationEnabled = true;
//                 $element[0].classList.add('menu-animated');
//               },
//               disableAnimation: function() {
//                 $scope.animationEnabled = false;
//                 $element[0].classList.remove('menu-animated');
//               },
//               offsetX: 0
//             };
//             sideMenuCtrl.setContent(content);
//       }
      
//       function prelink($scope, $element, $attr, sideMenuCtrl) {
//             var content = {
//               element: element[0],
//               onDrag: function() {},
//               endDrag: function() {},
//               setCanScroll: function(canScroll) {
//               var c = $element[0].querySelector('.scroll');
    
//                 if (!c) {
//                   return;
//                 }
    
//                 var content = angular.element(c.parentElement);
//                 if (!content) {
//                   return;
//                 }
    
//                 // freeze our scroll container if we have one
//                 var scrollScope = content.scope();
//                 scrollScope.scrollCtrl && scrollScope.scrollCtrl.freezeScrollShut(!canScroll);
//               },
//               getTranslateX: function() {
//                 return $scope.sideMenuContentTranslateX || 0;
//               },
//               setTranslateX: ionic.animationFrameThrottle(function(amount) {
//                 var xTransform = content.offsetX + amount;
//                 $element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(' + xTransform + 'px,0,0)';
//                 $timeout(function() {
//                   $scope.sideMenuContentTranslateX = amount;
//                 });
//               }),
//               setMarginLeft: ionic.animationFrameThrottle(function(amount) {
//                 if (amount) {
                   
//                   amount = parseInt(amount, 10);
//                   $element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(' + amount + 'px,0,0)';
//                   $element[0].style.width = ($window.innerWidth - amount) + 'px';
//                   content.offsetX = amount;
//                 } else {
//                   $element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(0,0,0)';
//                   $element[0].style.width = '';
//                   content.offsetX = 0;
//                 }
//               }),
//               setMarginRight: ionic.animationFrameThrottle(function(amount) {
//                 if (amount) {
//                   amount = parseInt(amount, 10);
//                   $element[0].style.width = ($window.innerWidth - amount) + 'px';
//                   content.offsetX = amount;
//                 } else {
//                   $element[0].style.width = '';
//                   content.offsetX = 0;
//                 }
//                 // reset incase left gets grabby
//                 $element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(0,0,0)';
//               }),
//               setMarginLeftAndRight: ionic.animationFrameThrottle(function(amountLeft, amountRight) {
//                 amountLeft = amountLeft && parseInt(amountLeft, 10) || 0;
//                 amountRight = amountRight && parseInt(amountRight, 10) || 0;
    
//                 var amount = amountLeft + amountRight;
    
//                 if (amount > 0) {
//                   $element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(' + amountLeft + 'px,0,0)';
//                   $element[0].style.width = ($window.innerWidth - amount) + 'px';
//                   content.offsetX = amountLeft;
//                 } else {
//                   $element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(0,0,0)';
//                   $element[0].style.width = '';
//                   content.offsetX = 0;
//                 }
//                 // reset incase left gets grabby
//                 //$element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(0,0,0)';
//               }),
//               enableAnimation: function() {
//                 $scope.animationEnabled = true;
//                 $element[0].classList.add('menu-animated');
//               },
//               disableAnimation: function() {
//                 $scope.animationEnabled = false;
//                 $element[0].classList.remove('menu-animated');
//               },
//               offsetX: 0
//             };
//             sideMenuCtrl.setContent(content);
//       }
//     }
//   };
// }])
;