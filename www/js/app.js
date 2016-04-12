// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','ionic.service.core', 'ionic-material', 'controllers', 'RESTConnection', 'TKServicesModule',
    'chart.js', 'SSFAlerts', 'ngIOS9UIWebViewPatch', 'SSFConfig', 'SSFAppCss', 'SSFSelectBusiness',
    'SSFSpinner', 'SSFDirectives', 'SSFDeploy'])

.run(["$ionicPlatform", "$window", "$state", "$ionicHistory", function($ionicPlatform, $window, $state, $ionicHistory) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      cordova.plugins.Keyboard.disableScroll(true); //asdf
    }
    if(window.StatusBar) {
      StatusBar.overlaysWebView(true)
      StatusBar.StatusBar.styleLightContent();
    }
    
    if($window.localStorage.companyId !== undefined) {
      $ionicHistory.nextViewOptions({
        historyRoot: true,
        disableBack: true
      });
      $state.go('emp-lobby');
    } else if($window.localStorage.userID !== undefined) {
      $ionicHistory.nextViewOptions({
        historyRoot: true,
        disableBack: true
      });
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
  .state('con-settings', {
    url: '/consumers-settings',
    cache: false,
    templateUrl: 'templates/consumers/con-settings.html',
    controller:'ConSettingsCtrl',
    resolve: {
      userInfo: ['$window', 'ConUserService', 'SSFAlertsService',
          function($window, ConUserService, SSFAlertsService) {
        return ConUserService.getById($window.localStorage.token, $window.localStorage.userID)
        .then(function(res) {
          if(res.status !== 200)
            SSFAlertsService.showAlert('Error', 'We could not retrieve your current data at this time.');
          return res.data;
        },function(err) {
          SSFAlertsService.showAlert('Error', 'We could not retrieve your current data at this time.');
          return {};
        });
      }]
    }
  })
  
  //employers
  .state('emp-lobby', {
    url: '/employer-lobby',
    templateUrl: 'templates/employers/emp-lobby.html',
    controller:'EmpLobbyCtrl',
    cache: false,
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
  .state('emp-settings', {
    url: '/employer-settings',
    cache: false,
    templateUrl: 'templates/employers/emp-settings.html',
    controller:'EmpSettingsCtrl',
    resolve: {
      employer: function(ServerEmployersService, $window) {
        return ServerEmployersService.get()
        .then(function(response) {
          for(var i in response.data) {
            if($window.localStorage.companyId === response.data[i].id) {
              return response.data[i];
            }
          }
        });
      }
    }
  })
  
  //forms
  // .state('login', {
  //   url: '/login',
  //   templateUrl: 'templates/forms/login.html',
  //   controller:'LoginCtrl'
  // })
  .state('con-login', {
    url: '/consumer-login',
    templateUrl: 'templates/forms/con-login.html',
    controller:'ConLoginCtrl'
  })
  .state('emp-login', {
    url: '/employer-login',
    templateUrl: 'templates/forms/emp-login.html',
    controller:'EmpLoginCtrl'
  })
  .state('con-register', {
    url: '/consumer-register',
    templateUrl: 'templates/forms/con-register.html',
    controller:'ConRegisterCtrl'
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
    cache: false,
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
  $urlRouterProvider.otherwise('/');
  
}])
.run(["$rootScope", "$ionicHistory", "$state", "$window", "ConUserService", "EmpUserService", "TKQuestionsService", 'SSFAppCssService',
    function($rootScope, $ionicHistory, $state, $window, ConUserService, EmpUserService, TKQuestionsService, SSFAppCssService) {

  $rootScope.$on('request:auth', function() {
    $ionicHistory.nextViewOptions({
      historyRoot: true,
      disableBack: true
    });
    SSFAppCssService.setCss();
    if($window.localStorage.token !== undefined) {
      if($window.localStorage.companyId !== undefined) {
        EmpUserService.logout($window.localStorage.token, $window.localStorage.userID);
      } else {
        ConUserService.logout($window.localStorage.token, $window.localStorage.userID);
      }
    }
    delete $window.localStorage['userEmployer'];
    delete $window.localStorage['firstName'];
    delete $window.localStorage['lastName'];
    delete $window.localStorage['token'];
    delete $window.localStorage['userID'];
    delete $window.localStorage['companyId'];
    TKQuestionsService.setCompanyUserData([]);
    $state.go('landing');
  });  
}]);