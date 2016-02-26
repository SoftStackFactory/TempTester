angular.module('controllers')
.controller('TkQuestionsCtrl', ['$scope', 'testInfo', '$stateParams', '$state', '$window',
    'TKAnswersService', 'ServerAnswersService', '$ionicHistory', 
    'TKResultsButtonService', 'SSFAlertsService', 'UserService',
    function($scope, testInfo, $stateParams, $state, $window, 
    TKAnswersService, ServerAnswersService, $ionicHistory, TKResultsButtonService,
    SSFAlertsService, UserService) {
  
  //testInfo is passed in the router to indicate the index
  var qNumber = $stateParams.testID;
  $scope.title = "Question #" + qNumber;

  $scope.$on("$ionicView.beforeEnter", function(){
    var lastQuestionNumber = TKAnswersService.getLastQuestionNumber();
    if(parseInt(qNumber) < lastQuestionNumber) {
      TKAnswersService.setLastQuestionNumber(lastQuestionNumber - 1);
      TKAnswersService.eraseLastAnswer();
    }
    TKAnswersService.setLastQuestionNumber(qNumber);
  });
  
  testInfo.forEach(function(infoDict) {
    if(infoDict.Answer_ID === "A")
      $scope.questionA = infoDict;
    if(infoDict.Answer_ID === "B")
      $scope.questionB = infoDict;
  });
  
  $scope.buttonClicked = function ( option ) {
    var category = $scope["question" + option].Style;
    TKAnswersService.saveAnswer(qNumber, category, option);
    
    var nextqNumber = Number(qNumber) + 1;
    if(nextqNumber > 30)
      return performRequest();
    $state.go('tk-questions.detail', {testID: nextqNumber});
  };
  
  function performRequest() {
    var answersDict = angular.copy(TKAnswersService.getAnswers());
    answersDict.answers = angular.copy(TKAnswersService.getArray());
    answersDict["userID"] = $window.localStorage['userID'];
    answersDict["employerId"] = $window.localStorage['userEmployer'];
    answersDict["original"] = true;
    var date = new Date();
    answersDict["createDate"] = date.toUTCString();
    delete answersDict.id;
    
    ServerAnswersService.create(answersDict, $window.localStorage['token'])
    .then(function(response) {
      if(response.status !== 200)
        confirmPrompt();
      UserService.updateUser($window.localStorage['token'], $window.localStorage['userID'], {'organization': $window.localStorage['userEmployer']});
      $ionicHistory.nextViewOptions({
        historyRoot: true,
        disableBack: true
      });
      TKAnswersService.setAnswers(answersDict);
      TKResultsButtonService.setShouldShowMenuButton(true);
      $state.go('tk-results');
    }, function(response) {
      // something went wrong
      confirmPrompt();
    });
  }
  
  function confirmPrompt() {
    SSFAlertsService.showConfirm("Warning","The answers could not be saved at the moment, do you want to try again?")
    .then(function(response){
      if(response == true) {
        performRequest();
      } else {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        TKResultsButtonService.setShouldShowMenuButton(true);
        $state.go('tk-results');
      }
    });
  }
}]);