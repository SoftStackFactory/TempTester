/*  Deploying will automatically update the app on a user's device only if
            no new plugins were added since the last build, and the user accepts a prompt.
Instructions:
1.  Inject 'SSFDeploy' into the app.js file.
2.  Place '<script src="js/SSFServices/SSFDeploy.js"></script>' into the index.html
            file above the app.js
3.  Terminal: ionic add ionic-platform-web-client
3.  Terminal: ionic plugin add ionic-plugin-deploy


Deploying from the Terminal:
1.  Be sure to be in the correct project directory.
2.  ionic upload --note "comments about the purpose of this deploy" --deploy=dev

From the ionic.io page:
1.  
*/


angular.module('SSFDeploy', [])
.config(["$stateProvider",
    function($stateProvider) {
  // The state information for updating the app
  $stateProvider
  .state('update', {
    url: '/update',
    template: 
      '<ion-view hide-nav-bar="true">' +
        '<ion-content class="padding calm-bg" style="text-align:center;">' +
            '<h3 class="white" style="margin-top: 30px;">Updating...</h3>' +
            '<h3 class="white">{{progress.value}}</h3>' +
            // '<!-- Customize background -->' +
        '</ion-content>' +
      '</ion-view>',
    controller: ["$scope", "$ionicLoading", "$state", "$ionicHistory",
        function($scope, $ionicLoading, $state, $ionicHistory) {
  
      $ionicLoading.show({
          template: '<ion-spinner></ion-spinner>',
          noBackdrop:true
      });
      $scope.progress = {
        value : "0%"
      };
      var deploy = new Ionic.Deploy();
      deploy.setChannel("dev");
      deploy.update().then(function(res) {
        //App will automatically reload when updated successfully
         console.log('Ionic Deploy: Update Success! ', res);
      }, function(err) {
        console.log('Ionic Deploy: Update error! ', err);
        goNext();
      }, function(prog) {
         console.log('Ionic Deploy: Progress... ', prog);
         var progString = prog.toString();
         var progArray = progString.split(".");
         $scope.$apply(function() {
           $scope.progress.value = progArray[0] + "%";
         });
      });
    
      function goNext() {
        $ionicLoading.hide();
        $ionicHistory.nextViewOptions({
          disableAnimate: true,
          historyRoot: true,
          disableBack: true
        });
        $state.go("landing");
      }
    }]
  });
}])
.config(['SSFConfigConstants', function(SSFConfigConstants) {
  SSFConfigConstants['SSFDeployService'] = {
	//SSFTranslate should create a 'textTranslated' object whenever it translates
    'languageFileReference': [
      'SSF_CONFIG_CONSTANTS.SSF_DEPLOY.TITLE',
      'SSF_CONFIG_CONSTANTS.SSF_DEPLOY.BODY',
      'SSF_CONFIG_CONSTANTS.SSF_DEPLOY.YES',
      'SSF_CONFIG_CONSTANTS.SSF_DEPLOY.NO'
    ],
    'notTranslated': [
      'Update Alert',
      'An update is ready for this application. Do you want to update now?',
      'Yes',
      'No'
    ]
  };
}])
.service('SSFDeployService', ['$window', '$ionicPlatform', 'SSFAlertsService',
    '$ionicHistory', '$state', '$rootScope', 'SSFConfigConstants',
    function($window, $ionicPlatform, SSFAlertsService,
    $ionicHistory, $state, $rootScope, SSFConfigConstants) {
  
  var serviceText,
  service = this;
  
  if(SSFConfigConstants.shouldTranslate) {
    serviceText = SSFConfigConstants.SSFDeployService.textTranslated;
  } else {
    serviceText = SSFConfigConstants.SSFDeployService.notTranslated;
  }
  service.updateServiceText = function() {
    if(SSFConfigConstants.shouldTranslate) {
      serviceText = SSFConfigConstants.SSFDeployService.textTranslated;
    } else {
      serviceText = SSFConfigConstants.SSFDeployService.notTranslated;
    }
  };
    
  // if($window.localStorage["userId"]) {
  //   $ionicAnalytics.track('Load-Returning', {
  //     ZibID: $window.localStorage["userId"]
  //   });
  // } else {
  //   $ionicAnalytics.track('Load-Returning', {
  //     ZibID: "anonymous"
  //   });
  // }
  service.checkForUpdate = function() {
    var deploy = new Ionic.Deploy();
    deploy.setChannel("dev");
    //Deploy check() checks for updates
    deploy.check()
    .then(function(hasUpdate) {
      // alert('hit 2: ' + hasUpdate);
      if(!hasUpdate)
        return; //no update, exit function
      deploy.getMetadata()
      .then(function(metadata) {
      // metadata will be a JSON object
        if(metadata["priority"] == "required")
          return goToUpdate();
          
        SSFAlertsService.showConfirm(serviceText[0], serviceText[1], serviceText[2], serviceText[3])
        .then(function(res) {
          if(res)
            goToUpdate();
        });
      }, function(err) {
        // alert('1' + JSON.stringify(err));
        // console.error('Ionic Deploy: Unable to check for updates', err);
      });
    },function(err) {
      // alert('0' + JSON.stringify(err));
    });
    function goToUpdate() {
      // //Custom Ionic analytics event
      // if($window.localStorage["userId"]) {
      //   $ionicAnalytics.track('User-Update', {
      //     ZibID: $window.localStorage["userId"]
      //   });
      // }
      $ionicHistory.nextViewOptions({
        disableAnimate: true,
        historyRoot: true,
        disableBack: true
      });
      $state.go("update");
    }
  };
}])

.run(['SSFDeployService', '$ionicPlatform',
    function(SSFDeployService, $ionicPlatform) {
  //checks for updates every time the app is instantiated
    // alert('hit 0');
  $ionicPlatform.ready(function() {
    // alert('hit 1');
    SSFDeployService.checkForUpdate();
  });
}])
;