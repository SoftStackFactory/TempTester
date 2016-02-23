// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ionic-material', 'starter.controllers', 'RESTConnection', 'TKServicesModule',
    'chart.js', 'SSFAlerts', 'ngIOS9UIWebViewPatch', 'SSFConfig', 'SSFSelectBusiness', 'SSFSpinner', 'SSFDirectives'])

.run(["$ionicPlatform", "$window", "$state", "$ionicHistory", function($ionicPlatform, $window, $state, $ionicHistory) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.overlaysWebView(true)
      StatusBar.StatusBar.styleLightContent();
    }
    
    if($window.localStorage.userID !== undefined) {
      $state.go('lobby');
    } else {
      $state.go('landing');
    }
    
    if($window.localStorage["userID"]!==undefined) {
        $ionicHistory.nextViewOptions({
            historyRoot: true,
            disableBack: true
        });
        $state.go("lobby");
    }
  });
}])
.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
  
  
  $stateProvider
  .state('landing', {
    url: '/',
    templateUrl: 'templates/landing.html',
    controller: ['$scope', 'SSFConfigConstants', '$state', '$timeout', 'ionicMaterialInk',
        'ionicMaterialMotion', '$ionicHistory',
        function($scope, SSFConfigConstants, $state, $timeout, ionicMaterialInk,
        ionicMaterialMotion, $ionicHistory) {
      $scope.$on('$ionicView.enter', function() {
        $ionicHistory.clearCache();
      });
      $timeout(function(){
        ionicMaterialInk.displayEffect();
        ionicMaterialMotion.ripple();
      },0);
      $scope.loginButton = function(whichLogin) {
        SSFConfigConstants.currentLogin = whichLogin;
        $state.go('login');
      };
      $scope.registerButton = function() {
        SSFConfigConstants.currentLogin = 'SSFUsers/';
        $state.go('register');
      };
    }]
  })
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller:'LoginCtrl'
  })
  .state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller:'RegisterCtrl'
  })
  .state('lobby', {
    url: '/lobby',
    templateUrl: 'templates/lobby.html',
    controller:'LobbyCtrl'
  })
  .state('test', {
    abstract: true,
    url: '/test',
    template: '<ion-nav-view></ion-nav-view>'
  })
  .state('test.detail', {
    url: '/question:testID',
    templateUrl: 'templates/question.html',
    controller: 'TestCtrl',
    resolve: {
      testInfo: function($stateParams, TKQuestionsService) {
        return TKQuestionsService.getQuestion($stateParams.testID);
      }
    }
  })
  .state('results', {
    cache:false,
    url: '/results',
    templateUrl: 'templates/results.html',
    controller:'ResultsCtrl'
  })
  .state('history', {
    cache: false,
    url: '/history',
    templateUrl: 'templates/history.html',
    controller:'HistoryCtrl'
  })
  .state('compHist', {
    abstract: true,
    url: '/compHist',
    template: '<ion-nav-view></ion-nav-view>'
  })
  .state('compHist.companyHistory', {
    url: '/companyHistory',
    templateUrl: 'templates/companyresults.html',
    controller:'companyHistoryCtrl',
    resolve: {
      employerName: function(ServerEmployersService, $window) {
        return ServerEmployersService.get()
        .then(function(response) {
          for(var i in response.data) {
            if($window.localStorage.companyId === response.data[i].id) {
              return response.data[i].company_name;
            }
          }
        });
      }
    }
  });
  $urlRouterProvider.otherwise('/');
  
}])
.run(["$rootScope", "$ionicHistory", "$state", "$window", function($rootScope, $ionicHistory, $state, $window) {

  $rootScope.$on('request:auth', function() {
    $ionicHistory.nextViewOptions({
      historyRoot: true,
      disableBack: true
    });
    delete $window.localStorage['token'];
    delete $window.localStorage['userID'];
    $state.go('landing');
  });  
}])
.run(['$window', function($window) {
  if($window.localStorage['appCss'] !== undefined) {
    var company = JSON.parse($window.localStorage['appCss']);
    var sheet = window.document.styleSheets[0];
    sheet.insertRule(
      '.app-button {' +
          'font-weight: bold !important;' + 
          'background-color: ' + company.buttonPrimary + ' !important;' + 
      '}', sheet.cssRules.length);
    sheet.insertRule(
      '.app-button-inverted {' + 
          'font-weight: bold !important;' + 
          'background-color: ' + company.buttonSecondary + ' !important;' + 
      '}', sheet.cssRules.length);
    sheet.insertRule(
      '.app-bar-header {' + 
          'background-color: ' + company.header + ' !important;' + 
      '}', sheet.cssRules.length);
    sheet.insertRule(
      '.app-tabs {' + 
          'font-weight: bold !important;' + 
          'background-color: ' + company.buttonPrimary + ' !important;' + 
      '}', sheet.cssRules.length);
  }
  // var sheet = window.document.styleSheets[0];
  // sheet.insertRule('.app-button {font-weight: bold !important;background-color: #A34D24 !important;font-family: "-apple-system", "Helvetica Neue", "Roboto", "Segoe UI", sans-serif !important;}', sheet.cssRules.length);
  // sheet.insertRule('.app-button-inverted {font-weight: bold !important;background-color: #808285 !important;font-family: "-apple-system", "Helvetica Neue", "Roboto", "Segoe UI", sans-serif !important;}', sheet.cssRules.length);
  // sheet.insertRule('.app-bar-header {background-color: #EB7C23 !important;}', sheet.cssRules.length);
  // sheet.insertRule('.app-tabs {font-weight: bold !important;background-color: #A34D24 !important;font-family: "-apple-system", "Helvetica Neue", "Roboto", "Segoe UI", sans-serif !important;}', sheet.cssRules.length);
}]);