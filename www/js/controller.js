angular.module('starter.controllers', [])

.controller('LobbyCtrl', ['$scope', '$state', '$ionicHistory', 'UserService','$window', 
        'ServerQuestionService', 'TKQuestionsService', 'TKAnswersService', 'SSFAlertsService',
        'ServerEmployersService', 'SSFSelectServices', '$timeout', 'ionicMaterialInk', 'ionicMaterialMotion',
        '$rootScope',
        function($scope, $state, $ionicHistory, UserService, $window, ServerQuestionService,
        TKQuestionsService, TKAnswersService, SSFAlertsService, ServerEmployersService,
        SSFSelectServices, $timeout, ionicMaterialInk, ionicMaterialMotion, $rootScope) {
    
    $timeout(function(){
        ionicMaterialInk.displayEffect();
        ionicMaterialMotion.ripple();
    },0);

    $scope.$on('$ionicView.enter', function() {
     // Code you want executed every time view is opened
        TKAnswersService.resetAnswers();
        if($window.localStorage.companyId !== undefined) {
            $ionicHistory.nextViewOptions({
                historyRoot: true,
                disableBack: true
            });
            $state.go('compHist.companyHistory');
        }
    });
    
    $scope.logout = function() {
        SSFAlertsService.showConfirm('Logout', 'Are you sure you want to logout?')
        .then(function(response) {
            if(response) {
                delete $window.localStorage['userEmployer'];
                delete $window.localStorage['token'];
                delete $window.localStorage['userID'];
                $ionicHistory.nextViewOptions({
                    historyRoot: true,
                    disableBack: true
                });
                $state.go('landing');
            }
        });
    //     UserService.logout($window.localStorage.token)
    //     .then(function(response) {
    //         //The successful code for logout is 204
    //         if(response.status === 204) {
    //             delete $window.localStorage['token'];
    //             delete $window.localStorage['userID'];
    //             $ionicHistory.nextViewOptions({
    //               historyRoot: true,
    //               disableBack: true
    //             });
    //             $state.go('landing');
    //         }
    //         else {
    //              SSFAlertsService.showAlert("Error","Could not logout at this moment, try again.");
    //         }
    //     }, function(response) {
    //         SSFAlertsService.showAlert("Error","Could not logout at this moment, try again.");
    //     });
    };
    
    //Get Questions Initially if they are not already stored
    if(TKQuestionsService.questionsLenght() === 0)
        getQuestions();
        
    function getQuestions()
    {
        ServerQuestionService.all($window.localStorage['token'])
        .then(function(response) {
            if (response.status === 200) {
                var questions = response.data;
                TKQuestionsService.setQuestions(questions);
            } else if(response.status !== 401) {
                // invalid response
                confirmPrompt();
            }
        }, function(response) {
            // something went wrong
            confirmPrompt();
        });
    }
    
    function confirmPrompt()
    {
        SSFAlertsService.showConfirm("Error","The questions could not be retrieved at this time, do you want to try again?")
        .then(function(response) {
            if (response == true) {
                getQuestions();
            }
        });
    }
    
    $scope.takeTestButtonTapped = function() {
        if($window.localStorage.userEmployer === undefined) {
            SSFAlertsService.showAlert('Error', 'Please select a company to share your results with, or select "None" to not share them.');
        }
        else if(TKQuestionsService.questionsLenght() === 0)
            getQuestions();
        else {
            $state.go('test.detail',{testID:1});
        }
    };
    
    $scope.selectEmployer = function($event) {
        SSFSelectServices.chooseEmployer($event, $scope, 'takeTestButtonTapped');
    };
}])

.controller('TestCtrl', ['$scope', 'testInfo', '$stateParams', '$state', '$window',
'TKQuestionsService', 'TKAnswersService', 'ServerAnswersService', '$ionicHistory', 
'TKResultsButtonService', 'SSFAlertsService', 'UserService', 'ServerCompanyToTestsService',
function($scope, testInfo, $stateParams, $state, $window, TKQuestionsService, 
TKAnswersService, ServerAnswersService, $ionicHistory, TKResultsButtonService,
SSFAlertsService, UserService, ServerCompanyToTestsService) {
    //testInfo is passed in the router to indicate the index
    var qNumber = $stateParams.testID;
    $scope.title = "Question #"+qNumber;

    $scope.$on("$ionicView.beforeEnter", function(){
        var lastQuestionNumber = TKAnswersService.getLastQuestionNumber();
        if(parseInt(qNumber)<lastQuestionNumber)
        {
            TKAnswersService.setLastQuestionNumber(lastQuestionNumber-1);
            TKAnswersService.eraseLastAnswer();
        }
        TKAnswersService.setLastQuestionNumber(qNumber);
    });
    
    testInfo.forEach(function(infoDict)
    {
        if(infoDict.Answer_ID === "A")
            $scope.questionA = infoDict;
        if(infoDict.Answer_ID === "B")
            $scope.questionB = infoDict;
    });
    
    $scope.buttonClicked = function ( option ) {
        var category = $scope["question"+option].Style;
        TKAnswersService.saveAnswer(qNumber, category, option);
        
        var nextqNumber = Number(qNumber) +1;
        if(nextqNumber>30) {
            performRequest();
        }else {
            $state.go('test.detail',{testID:nextqNumber});
        }
    };
    
    function performRequest()
    {
        var answersDict = angular.copy(TKAnswersService.getAnswers());
        answersDict["userID"] = $window.localStorage['userID'];
        answersDict["employerId"] = $window.localStorage['userEmployer'];
        answersDict["original"] = true;
        var date = new Date();
        answersDict["createDate"] = date.toUTCString();
        delete answersDict.id;
        ServerAnswersService.create(answersDict, $window.localStorage['token'])
        .then(function(response) {
            if (response.status === 200) {
                UserService.updateUser($window.localStorage['token'], $window.localStorage['userID'], {'organization': $window.localStorage['userEmployer']});
                $ionicHistory.nextViewOptions({
                  disableBack: true
                });
                TKAnswersService.setAnswers(answersDict);
                TKResultsButtonService.setShouldShowMenuButton(true);
                $state.go('results');
            } else if(response.status !== 401) {
                // invalid response
                confirmPrompt();
            }
        }, function(response) {
            // something went wrong
            confirmPrompt();
        });
    }
    
    function confirmPrompt()
    {
        SSFAlertsService.showConfirm("Warning","The answers could not be saved at the moment, do you want to try again?")
        .then(function(response){
            if (response == true) {
                performRequest();
            }else {
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                TKResultsButtonService.setShouldShowMenuButton(true);
                $state.go('results');
            }
        });
    }
    
}])
.controller('ResultsCtrl', ['$scope', 'TKAnswersService', '$ionicHistory', '$state',
        'TKResultsButtonService', '$window',
        'ServerEmployersService', 'ServerAnswersService', 'SSFAlertsService',
        'SSFSelectServices',
        function($scope, TKAnswersService, $ionicHistory, $state, TKResultsButtonService,
        $window, ServerEmployersService, ServerAnswersService,
        SSFAlertsService, SSFSelectServices) {
    
    $scope.$on('$ionicView.enter', function() {
        // Code you want executed every time view is opened
        $scope.isCompany = $window.localStorage['companyId'] !== undefined ? true : false;
    });
    $scope.isCompany = $window.localStorage['companyId'] !== undefined ? true : false;
    
    $scope.selectEmployer = function($event) {
        SSFSelectServices.chooseEmployer($event, $scope, 'addEmployer');
    };
    
    $scope.shouldShowButton = TKResultsButtonService.getShouldShowMenuButton();
    $scope.menuButtonTapped = function() {
        $ionicHistory.nextViewOptions({
            historyRoot: true,
            disableBack: true
        });
        $state.go('lobby');
    };
    
    $scope.labels = ["Competing", "Collaborating", "Compromising", "Avoiding", "Accommodating"];

    ServerEmployersService.get()
    .then(function(response) {
        $scope.employers = response.data;
    });
    
    $scope.companyChange = function() {
        $window.localStorage['userEmployer'] = $scope.user.organization;
    };
    
    var answersInfo = TKAnswersService.getAnswers();
    
    
    $scope.addEmployer = function() {
        var newInstanceResult = {};
        for(var i in answersInfo) {
            if(i !== '$$hashKey' && i !== 'id') {
                newInstanceResult[i] = answersInfo[i];
            }
        }
        newInstanceResult.employerId = $window.localStorage['userEmployer'];
        newInstanceResult.original = false;
        ServerAnswersService.checkAll(newInstanceResult.userID, newInstanceResult.employerId, answersInfo.createDate, $window.localStorage.token)
        .then(function(response) {
            if(response.data.length === 0) {
                if(newInstanceResult.userID === undefined) {
                    newInstanceResult.userID = $window.localStorage.userID;
                }
                ServerAnswersService.create(newInstanceResult, $window.localStorage.token)
                .then(function(newInstance) {
                });
            }
            else {
                SSFAlertsService.showAlert('Error', 'This result has already been shared with that employer.');
            }
        });
    };
   
    $scope.data = [[returnPercentage(answersInfo["competing"]), returnPercentage(answersInfo["collaborating"]), 
        returnPercentage(answersInfo["compromising"]), returnPercentage(answersInfo["avoiding"]), returnPercentage(answersInfo["accommodating"])]];
    
    $scope.options = {
        scaleIntegersOnly: true,
        animation: true,
        responsive:true,
        maintainAspectRatio: false,
        scaleOverride: true,
        scaleSteps: 4,
        scaleStepWidth: 25,
        scaleStartValue: 0,
        scaleLabel: "<%=value%>"+"%",
        tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value.toFixed(0) %>"+"%",
    };
    
    $scope.colours = [{
        fillColor: "rgba(151,187,205,0.2)",
        strokeColor: "rgba(15,187,25,1)",
        pointColor: "rgba(15,187,25,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(151,187,205,0.8)"
    }];
    
    function returnPercentage (value)
    {
        return (value/12)*100;
    }

}])
.controller('HistoryCtrl', ['$scope', 'ServerAnswersService', '$window', '$state', 'TKAnswersService',
        'TKResultsButtonService', 'SSFAlertsService', 'TKQuestionsService',
        function($scope, ServerAnswersService, $window, $state, TKAnswersService, TKResultsButtonService,
        SSFAlertsService, TKQuestionsService) {
    
    $scope.pageTitle = 'My Results';
    
    $scope.tests = TKQuestionsService.getCompanyUserData();
    
    if($scope.tests.length === 0) {
        performRequest();
    }
    else {
        $scope.pageTitle = $scope.tests[0].firstName + ' ' + $scope.tests[0].lastName + "'s Results";
    }
    
    function performRequest()
    {
        ServerAnswersService.all($window.localStorage['userID'], $window.localStorage['token'])
        .then(function(response) {
            if (response.status === 200) {
                //Should return an array of tests
                $scope.tests = response.data;
            } else if(response.status !== 401) {
                // invalid 
                confirmPrompt();
            }
        }, function(response) {
            // something went wrong
            confirmPrompt();
        });
    }

    function confirmPrompt()
    {
        SSFAlertsService.showConfirm("Warning","The tests could not be retrieved at the moment, do you want to try again?")
        .then(function(response){
            if (response === true) {
                performRequest();
            } 
        });
    }
    
    $scope.goToResult = function(test)
    {
        // var answers = {
        //     "competing": test.competing,
        //     "collaborating": test.collaborating,
        //     "compromising": test.compromising,
        //     "avoiding": test.avoiding,
        //     "accommodating": test.accommodating
        // };
        TKAnswersService.setAnswers(test);
        TKResultsButtonService.setShouldShowMenuButton(false);
        $state.go('results');
    };
}])
.controller('companyHistoryCtrl', ['$scope', 'ServerAnswersService', '$window', '$state', 'UserService',
        'TKAnswersService', 'TKResultsButtonService', 'SSFAlertsService',
        'TKQuestionsService', '$ionicHistory', '$rootScope', 'ServerEmployersService', 'employerName',
        function($scope, ServerAnswersService, $window, $state, UserService, TKAnswersService,
        TKResultsButtonService, SSFAlertsService, TKQuestionsService, $ionicHistory,
        $rootScope, ServerEmployersService, employerName) {
    
    var currentDate, page;
    $scope.employerName = employerName;
    
    $scope.tests = [];
    $scope.testResults = [];
    
    $scope.goToResult = function(test) {
        var answers = {
            "competing": test.competing,
            "collaborating": test.collaborating,
            "compromising": test.compromising,
            "avoiding": test.avoiding,
            "accommodating": test.accommodating
        };
        TKAnswersService.setAnswers(test);
        TKResultsButtonService.setShouldShowMenuButton(false);
        $state.go('results');
    };
    
    $scope.logout = function() {
        SSFAlertsService.showConfirm('Logout', 'Are you sure you want to logout?')
        .then(function(response) {
            if(response) {
                TKQuestionsService.setCompanyUserData([]);
                delete $window.localStorage['userEmployer'];
                delete $window.localStorage['token'];
                delete $window.localStorage['userID'];
                delete $window.localStorage['companyId'];
                $ionicHistory.nextViewOptions({
                    historyRoot: true,
                    disableBack: true
                });
                $state.go('landing');
            }
        });
    };
    $scope.companiesArray = [];
    $scope.refreshResults = function() {
        performRequest();
    };
    $scope.doRefresh = function() {
        page = {'nextPage': undefined};
        currentDate = new Date();
        currentDate = currentDate.toUTCString();
        $rootScope.stopSpinner = true;
        performRequest()
        .then(function(res) {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
    $scope.doRefresh();
    $scope.scrollResults = function() {
        if(page.nextPage <= page.totalPages) {
            performRequest();
        }
    };
    function performRequest() {
        return ServerAnswersService.allByEmployerId(currentDate, undefined, page.nextPage, $window.localStorage.companyId, $window.localStorage.token)
        .then(function(response) {
            $scope.persons = response.data.results;
            for (var i in $scope.persons) {
                $scope.persons[i].dataArray = [[returnPercentage($scope.persons[i].competing), returnPercentage($scope.persons[i].collaborating), 
                returnPercentage($scope.persons[i].compromising), returnPercentage($scope.persons[i].avoiding), returnPercentage($scope.persons[i].accommodating)]];
            }
            page = {'nextPage': response.data.nextPage, 'totalPages': response.data.totalPages};
            return response;
        },function(err) {
            console.log(err);
        });
    }
    
    $scope.ifTest = function(count) {
        if (count == 1) {
            return 'Test';
        } else {
            return 'Tests';
        }
    };
    
    $scope.moreTests = function(userData) {
        var tempDate = new Date();
        tempDate = tempDate.toUTCString();
        ServerAnswersService.allBySharedId(tempDate, undefined, undefined, $window.localStorage.companyId, $window.localStorage.token, userData.userID)
        .then(function(res) {
            if(res.status === 200) {
                res.data.results[0].firstName = userData.firstName;
                res.data.results[0].lastName = userData.lastName;
                TKQuestionsService.setCompanyUserData(res.data.results);
                $state.go('history');
            }
        },function(err) {
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

    function returnPercentage (value)
    {
        return (value/12)*100;
    }
    
    function confirmPrompt()
    {
        SSFAlertsService.showConfirm("Warning","The tests could not be retrieved at the moment, do you want to try again?")
        .then(function(response){
            if (response === true) {
                performRequest();
            } 
        });
    }
}]);