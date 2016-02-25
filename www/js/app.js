// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ionic-material', 'starter.controllers', 'controllers', 'RESTConnection', 'TKServicesModule',
    'chart.js', 'SSFAlerts', 'ngIOS9UIWebViewPatch', 'SSFConfig', 'SSFAppCss', 'SSFSelectBusiness', 'SSFSpinner', 'SSFDirectives'])

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
    
    $ionicHistory.nextViewOptions({
      historyRoot: true,
      disableBack: true
    });
    if($window.localStorage.companyId !== undefined) {
      $state.go('compHist.companyHistory');
    } else if($window.localStorage.userID !== undefined) {
      $state.go('lobby');
    } else {
      $state.go('landing');
    }
    
    // if($window.localStorage["userID"]!==undefined) {
    //     $ionicHistory.nextViewOptions({
    //         historyRoot: true,
    //         disableBack: true
    //     });
    //     $state.go("lobby");
    // }
  });
}])
.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
  
  
  $stateProvider
  .state('landing', {
    url: '/',
    templateUrl: 'templates/landing.html',
    controller: 'LandingCtrl'
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
}]);