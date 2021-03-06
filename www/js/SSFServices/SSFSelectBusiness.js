/*
Instructions:
1.  Inject 'SSFSelectBusiness' into the app.js file before any of the other SSFServices.
2.  Place '<script src="js/SSFServices/SSFSelectBusiness.js"></script>' into the index.html
            file above the app.js.
*/


angular.module('SSFSelectBusiness', [])
.service('SSFSelectServices', ['$ionicPopover', 'ServerEmployersService', '$window', '$ionicModal', 'SSFAppCssService',
        'SSFAlertsService', 'SSFConfigConstants',
        function($ionicPopover, ServerEmployersService, $window, $ionicModal, SSFAppCssService, SSFAlertsService, SSFConfigConstants) {
    
    var service = this;
    
    service.chooseEmployer = function($event, $scope, continueFunction, sharedArray, testDetails) {
        
        ServerEmployersService.get()
        .then(function(response) {
            $scope.employers = response.data;
            for(var i in $scope.employers) {
                $scope.employers[i].shared = false;
                for(var j in sharedArray) {
                    if($scope.employers[i].id ===  sharedArray[j]) {
                        $scope.employers[i].shared = true;
                        break;
                    }
                }
            }
            if($window.localStorage['userEmployer'] !== undefined) {
                $scope.user.organization = $window.localStorage['userEmployer'];
            }
        });
        $scope.noEmp = function() {
            $scope.chooseEmployer.remove();
        };
        $scope.companyChange = function(company) {
            if(company === 'None') {
                $window.localStorage['userEmployer'] = 'None';
                return $scope.closeEmployerPopover();
            }
            $window.localStorage['userEmployer'] = company.id;
            // SSFAppCssService.setCss(company.buttonPrimary, company.buttonSecondary, company.header);
            if(company.shared)
                return SSFAlertsService.showAlert('Error', 'You have already shared these results with this employer.');
            $scope.closeEmployerPopover();
        };
        $scope.user = {};
        
          $scope.ssfInputModal =function() {
            if($window.innerWidth < SSFConfigConstants.SSFDirectives.contentWidth) {
              return {
                width: $window.innerWidth + 'px',
                margin: 'auto',
                height: '100%',
                top: '0%',
                right: '0%',
                bottom: '0%',
                left: '0%'
              };
            } else {
              return {
                width: SSFConfigConstants.SSFDirectives.contentWidth + 'px',
                margin: 'auto',
                height: '100%',
                top: '0%',
                right: '0%',
                bottom: '0%',
                left: '0%'
              };
            }
          };
        var template = 
            '<ion-modal-view ng-style="ssfInputModal()">'+
                '<ion-header-bar>'+
                    '<h1 class="title">Pick an Employer</h1>'+
                    '<div class="button button-icon button-clear" ng-click="closeModal()"><button class="button-icon icon ion-close-round"></button></div>' +
                '</ion-header-bar>'+
                '<ion-content>';
        if(testDetails !== undefined) template += '<div class="card padding"><div class="padding item item-text-wrap">' + testDetails + '</div></div>';
        template += '<div class="item"  ng-click="companyChange(\'None\')">' +
                        '<img style="height: 40px; width: 40px; vertical-align: middle;">'+
                        ' None' +
                    '</div>'+
                    '<div class="item item-icon-right" ng-repeat="employer in employers" ng-click="companyChange(employer)">'+
                        '<img ng-src="{{employer.iconUrl}}" style="height: 40px; width: 40px; vertical-align: middle;"> {{employer.company_name}}'+
                        '<ion-icon class="icon ion-checkmark balanced" ng-show="employer.shared"></ion-icon>'+
                    '</div>'+
                '</ion-content>'+
            '</ion-modal-view>';
        
        $scope.chooseEmployer = $ionicModal.fromTemplate(template, {
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: false
        });
        $scope.chooseEmployer.show();
        
        
        $scope.closeEmployerPopover = function() {
            $scope.chooseEmployer.remove();
            $scope[continueFunction]();
        };
        
        $scope.closeModal = function() {
            $scope.chooseEmployer.remove();
        };
        $scope.test = 'Test Sample';
    };
}])
;