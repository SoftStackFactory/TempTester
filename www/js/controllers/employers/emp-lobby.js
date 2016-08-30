angular.module('controllers')
.controller('EmpLobbyCtrl', ['$scope', 'ServerAnswersService', '$window', '$state',
        'TKAnswersService', 'TKResultsButtonService', 'SSFAlertsService',
        'TKQuestionsService', '$rootScope', 'employerName', 'ServerQuestionService',
        '$ionicModal', 'SSFConfigConstants',
        function($scope, ServerAnswersService, $window, $state, TKAnswersService,
        TKResultsButtonService, SSFAlertsService, TKQuestionsService,
        $rootScope, employerName, ServerQuestionService, $ionicModal, SSFConfigConstants) {
    
	var lastYear = new Date();
	lastYear.setFullYear(lastYear.getFullYear() - 1);
    var today = new Date();
    $scope.endDate = new Date().toJSON();
    $scope.startDate = new Date().setDate(today.getDate()-90);
    
    
    $scope.search = {};
    var page;
    $scope.employerName = employerName;
    
    $scope.tests = [];
    $scope.testResults = [];
    
    $scope.goToResult = function(test) {
        TKAnswersService.setAnswers(test);
        TKResultsButtonService.setShouldShowMenuButton(false);
        $state.go('tk-results');
    };
    
    $scope.logout = function() {
        SSFAlertsService.showConfirm('Logout', 'Are you sure you want to logout?')
        .then(function(response) {
            if(response)
                $rootScope.$broadcast('request:auth');
        });
    };
    $scope.companiesArray = [];
    $scope.refreshResults = function() {
        performRequest();
    };
    $scope.doRefresh = function() {
        page = {'nextPage': undefined};
        $rootScope.stopSpinner = false;
        performRequest()
        .then(function(res) {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
    $scope.doRefresh();
    $scope.stopScrolling = false;
    $scope.scrollResults = function() {
        // if(page.nextPage <= page.totalPages) {
            performRequest();
        // }
    };
    function performRequest(startMonth, endMonth, isNew) {
        if(isNew) page = {'nextPage': undefined};
        if(startMonth) $scope.startDate = startMonth;
        if(endMonth) $scope.endDate = endMonth;
        return ServerAnswersService.allByEmployerId($scope.endDate, 10000, page.nextPage, $window.localStorage.companyId, $window.localStorage.token, $scope.startDate)
        .then(function(response) {
            // $scope.$broadcast('scroll.infiniteScrollComplete');
            if(response.status !== 200)
                return $scope.stopScrolling = true;
            $scope.persons = response.data.results;
            for (var i in $scope.persons) {
                $scope.persons[i].dataArray = [[competingPercentage($scope.persons[i].competing), collaboratingPercentage($scope.persons[i].collaborating), 
                compromisingPercentage($scope.persons[i].compromising), avoidingPercentage($scope.persons[i].avoiding), accommodatingPercentage($scope.persons[i].accommodating)]];
            }
            page = {'nextPage': response.data.nextPage, 'totalPages': response.data.totalPages};
            return response;
        },function(err) {
            $scope.stopScrolling = true;
            if(err.data === null)
                return;
            SSFAlertsService.showConfirm('Error', 'There was a problem getting more results, do you want to try again?')
            .then(function(res) {
                if(res)
                    $scope.stopScrolling = false;
            });
        });
    }
    
    $scope.ifTest = function(count) {
        if(count == 1)
            return 'Test';
        return 'Tests';
    };
    
    $scope.moreTests = function(userData) {
        var tempDate = new Date();
        tempDate = tempDate.toUTCString();
        ServerAnswersService.allBySharedId(tempDate, 15, undefined, $window.localStorage.companyId, $window.localStorage.token, userData.userID)
        .then(function(res) {
            if(res.status !== 200)
                return SSFAlertsService.showConfirm('Error', 'Something went wrong with getting the users results.')
                .then(function(res) {
                    if(res)
                        $scope.moreTests();
                    return;
                });
            res.data.results[0].firstName = userData.firstName;
            res.data.results[0].lastName = userData.lastName;
            TKQuestionsService.setCompanyUserData(res.data.results);
            $state.go('tk-history');
        },function(err) {
            if(err.data === null)
                return SSFAlertsService.showAlert('Error', 'We cannot retrieve the data while offline.');
            return SSFAlertsService.showConfirm('Error', 'Something went wrong with getting the users results.')
            .then(function(res) {
                if(res)
                    $scope.moreTests();
                return;
            });
        });
    };

    $scope.options = {
        scaleIntegersOnly: true,
        animation: true,
        responsive:true,
        maintainAspectRatio: false,
        showScale: false,
        scaleOverride: true,
        scaleSteps: 4,
        scaleStepWidth: 25,
        scaleStartValue: 0,
        tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value.toFixed(0) %>"+"%"
    };
    
    $scope.colours = [{
        fillColor: "rgba(151,187,205,0.2)",
        strokeColor: "rgba(15,187,25,1)",
        pointColor: "rgba(15,187,25,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(151,187,205,0.8)"
    }];
    
    $scope.labels = ["Competing", "Collaborating", "Compromising", "Avoiding", "Accommodating"];

    function competingPercentage(value) {
        // missing 8 and 10
        var returnValue = [0, 5, 10, 20, 30, 40, 55, 70, 75, 80, 85, 90, 100];
        return returnValue[value];
    }
    function collaboratingPercentage(value) {
        // missing 11
        var returnValue = [0, 2.5, 5, 7.5, 10, 18, 25, 40, 55, 75, 80, 85, 90];
        return returnValue[value];
    }
    function compromisingPercentage(value) {
        // missing 9, 9, and 10
        var returnValue = [0, 2.5, 5, 7.5, 15, 25, 35, 50, 60, 70, 80, 90, 100];
        return returnValue[value];
    }
    function avoidingPercentage(value) {
        // missing 7 and 9
        var returnValue = [2.5, 5, 7.5, 10, 20, 30, 50, 65, 80, 85, 90, 95, 100];
        return returnValue[value];
    }
    function accommodatingPercentage(value) {
        // missing 8 and 9
        var returnValue = [2.5, 5, 7.5, 20, 35, 55, 75, 80, 83.3, 86.7, 90, 95, 100];
        return returnValue[value];
    }
    
    $scope.anyResults = function() {
        if($scope.persons === undefined)
            return true;
        if($scope.persons.length === 0)
            return false;
        return true;
    };
    
    if(TKQuestionsService.questionsLenght() === 0)
        getQuestions();
        
    function getQuestions() {
        ServerQuestionService.all($window.localStorage['token'])
        .then(function(response) {
            if(response.status === 401)
                return confirmPrompt();
            if(response.status !== 200)
                return SSFAlertsService.showAlert('Error', 'Some unknown error occurred.');
            var questions = response.data;
            TKQuestionsService.setQuestions(questions);
        }, function(response) {
            // something went wrong
            confirmPrompt();
        });
    }
    
    function confirmPrompt() {
        SSFAlertsService.showConfirm("Error","The questions could not be retrieved at this time, do you want to try again?")
        .then(function(response) {
            if(response == true)
                getQuestions();
        });
    }
    
    $scope.hover = false;
    
    $scope.resetSearch = function() {
        $scope.search = {};
    };
  
  
  
	$scope.addDate = function($event) {
		var dates = {
			start: $scope.startDate,
			end: $scope.endDate
		};
		dateRangeModal($event, $scope, dates, performRequest);
	};
	
	
    function dateRangeModal($event, $scope, isOld, submitFunction) {
        //{start: '', end: ''}
        //isInvoice: if you're editing the Purchase Order or the Invoice
        //isOld: if you're adding a new Purchase Order/Invoice, set it to false
                //if you're editing an existing PO/Invoice, pass in the object here
        //submitFunction: pass in a string for the name of the '$scope.functionName = function(form, inputs) {'
                //like so "SubRepModal.set($event, $scope, true, true, 'functionName')"
        $scope.SubRepModal = {};
        var tempObj = JSON.parse(JSON.stringify(isOld));
        tempObj.start = new Date(tempObj.start);
        tempObj.end = new Date(tempObj.end);
        $scope.SubRepModal.ngModel = tempObj;
        
        $ionicModal.fromTemplateUrl('templates/daterange-modal.html', {
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: false
        })
        .then(function(res) {
            $scope.SubRepModal.modal = res;
            $scope.SubRepModal.modal.show();
        });
        
        $scope.SubRepModal.close = function() {
            $scope.SubRepModal.modal.remove();
        };
        $scope.SubRepModal.submit = function(form, startMonth, endMonth) {
            if(form.$invalid)
                return SSFAlertsService.showAlert('Error', 'Fill in all required fields marked with a red border.');
            if ($scope.SubRepModal.ngModel.start > $scope.SubRepModal.ngModel.end) {
                return SSFAlertsService.showAlert('Error', 'Start Date must be set before End Date.');
            }
            $scope.SubRepModal.close();
            submitFunction(startMonth, endMonth, true);
        };
    }
    
// 	$scope.getMonthData = function(startMonth, endMonth) {
// 	    $scope.endDate = endMonth;
// 		$scope.startDate = startMonth;
//         ServerAnswersService.allByEmployerId($scope.endDate, 15, page.nextPage, $window.localStorage.companyId, $window.localStorage.token, startMonth)
//         .then(function(response) {
//             if(response.status !== 200)
//                 return stopScrolling = true;
//             $scope.persons = response.data.results;
//             for (var i in $scope.persons) {
//                 $scope.persons[i].dataArray = [[competingPercentage($scope.persons[i].competing), collaboratingPercentage($scope.persons[i].collaborating), 
//                 compromisingPercentage($scope.persons[i].compromising), avoidingPercentage($scope.persons[i].avoiding), accommodatingPercentage($scope.persons[i].accommodating)]];
//             }
//             page = {'nextPage': response.data.nextPage, 'totalPages': response.data.totalPages};
//             return response;
//         },function(err) {
//             stopScrolling = true;
//             if(err.data === null)
//                 return;
//             SSFAlertsService.showConfirm('Error', 'There was a problem getting more results, do you want to try again?')
//             .then(function(res) {
//                 if(res)
//                     stopScrolling = false;
//             });
//         });
// 	};
	
	$scope.ssfInputModal = function() {
		if ($window.innerWidth < SSFConfigConstants.SSFDirectives.contentWidth) {
			return {
				width: $window.innerWidth + 'px',
				margin: 'auto',
				height: '100%',
				top: '0%',
				right: '0%',
				bottom: '0%',
				left: '0%'
			};
		}
		else {
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
}]);