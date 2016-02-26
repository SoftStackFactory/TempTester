// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ionic-material', 'controllers', 'RESTConnection', 'TKServicesModule',
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
      $state.go('emp-lobby');
    } else if($window.localStorage.userID !== undefined) {
      $state.go('con-lobby');
    } else {
      $state.go('landing');
    }
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
  
  //consumers
  .state('con-lobby', {
    url: '/consumers-lobby',
    templateUrl: 'templates/consumers/con-lobby.html',
    controller:'ConLobbyCtrl'
  })
  
  //employers
  .state('emp-lobby', {
    url: '/employer-lobby',
    templateUrl: 'templates/employers/emp-lobby.html',
    controller:'EmpLobbyCtrl',
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
  })
  
  //forms
  .state('login', {
    url: '/login',
    templateUrl: 'templates/forms/login.html',
    controller:'LoginCtrl'
  })
  .state('register', {
    url: '/register',
    templateUrl: 'templates/forms/register.html',
    controller:'RegisterCtrl'
  })
  
  //TKTest
  .state('tk-questions', {
    abstract: true,
    url: '/test',
    template: '<ion-nav-view></ion-nav-view>'
  })
  .state('tk-questions.detail', {
    url: '/tk-question:testID',
    templateUrl: 'templates/tktest/tk-questions.html',
    controller: 'TkQuestionsCtrl',
    resolve: {
      testInfo: function($stateParams, TKQuestionsService) {
        return TKQuestionsService.getQuestion($stateParams.testID);
      }
    }
  })
  .state('tk-results', {
    cache:false,
    url: '/tk-results',
    templateUrl: 'templates/tktest/tk-results.html',
    controller:'TkResultsCtrl'
  })
  .state('tk-history', {
    cache: false,
    url: '/tk-history',
    templateUrl: 'templates/tktest/tk-history.html',
    controller:'TkHistoryCtrl'
  });
  // .state('history', {
  //   cache: false,
  //   url: '/history',
  //   templateUrl: 'templates/tktest/tk-history.html',
  //   controller:'TkHistoryCtrl'
  // });
  $urlRouterProvider.otherwise('/');
  
}])
.run(["$rootScope", "$ionicHistory", "$state", "$window", "UserService", "TKQuestionsService", 'SSFAppCssService',
    function($rootScope, $ionicHistory, $state, $window, UserService, TKQuestionsService, SSFAppCssService) {

  $rootScope.$on('request:auth', function() {
    $ionicHistory.nextViewOptions({
      historyRoot: true,
      disableBack: true
    });
    SSFAppCssService.setCss();
    if($window.localStorage.token !== undefined)
      UserService.logout($window.localStorage.token);
    delete $window.localStorage['userEmployer'];
    delete $window.localStorage['token'];
    delete $window.localStorage['userID'];
    delete $window.localStorage['companyId'];
    TKQuestionsService.setCompanyUserData([]);
    $state.go('landing');
  });  
}]);