/*
Instructions:
1.  Inject 'SSFSelectBusiness' into the app.js file before any of the other SSFServices.
2.  Place '<script src="js/SSFServices/SSFSelectBusiness.js"></script>' into the index.html
            file above the app.js.
*/


angular.module('SSFSelectBusiness', [])
.service('SSFSelectServices', ['$ionicPopover', 'ServerEmployersService', '$window', '$ionicModal', 'SSFAppCssService',
        function($ionicPopover, ServerEmployersService, $window, $ionicModal, SSFAppCssService) {
    
    var service = this;
    
    service.chooseEmployer = function($event, $scope, continueFunction) {
        
        ServerEmployersService.get()
        .then(function(response) {
            $scope.employers = response.data;
            if($window.localStorage['userEmployer'] !== undefined) {
                $scope.user.organization = $window.localStorage['userEmployer'];
            }
        });
        
        $scope.companyChange = function(company) {
            $window.localStorage['userEmployer'] = company.id;
            SSFAppCssService.setCss(company.buttonPrimary, company.buttonSecondary, company.header);
            $scope.closeEmployerPopover();
        };
        $scope.user = {};
        
        var template = 
            '<ion-modal-view>'+
                '<ion-header-bar>'+
                    '<h1 class="title">Pick an Employer</h1>'+
                    '<div class="button button-icon button-clear" ng-click="closeModal()"><button class="button-icon icon ion-close-round"></button></div>' +
                '</ion-header-bar>'+
                '<ion-content>'+
                    '<div class="item" ng-repeat="employer in employers" ng-click="companyChange(employer)">'+
                        '{{employer.company_name}}'+
                    '</div>'+
                    '<div class="item" ng-click="companyChange('+ "'none'"+ ')">None</div>'+
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