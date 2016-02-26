angular.module('RESTConnection', [])
.constant('ENDPOINT_URL', 'https://strongloop-backend-jbrownssf.c9.io/api/')

.service('UserService', ['$http', 'ENDPOINT_URL', 'SSFConfigConstants',
function ($http, ENDPOINT_URL, SSFConfigConstants) {
  var service = this;
  // path = 'SSFUsers/';
  
  function getUrl() {
    return ENDPOINT_URL + 'SSFUsers/';
  }
  
  service.create = function (user) {
    return $http.post(getUrl(), user);
  };
  
  service.login = function(user) {
    user['ttl'] = 1209600000;
    return $http.post(ENDPOINT_URL + SSFConfigConstants.currentLogin + 'login', user);
  };
  
  service.updateUser = function(token, userId, newModel) {
    return $http({
      url: getUrl()+userId,
      method: 'PUT',
      data: newModel,
      headers: {
        'Authorization': token
      }
   });
  };
  
  service.logout = function(token) {
    return $http({
        url: ENDPOINT_URL + SSFConfigConstants.currentLogin + 'logout',
        method: 'POST',
        headers: {
          'Authorization': token
        }
     });
  };
}])

.service('ServerQuestionService', ['$http', 'ENDPOINT_URL',
function ($http,  ENDPOINT_URL) {
  var service = this,
  path = 'Questions/';

  function getUrl() {
    return ENDPOINT_URL + path;
  }

  service.all = function (token) {
    return $http.get(getUrl(), {
        params: { access_token: token }
    });
  };

}])
.service('ServerAnswersService', ['$http', 'ENDPOINT_URL', 
function ($http, ENDPOINT_URL) {
  var service = this,
  path = 'TestResults/';

  function getUrl() {
    return ENDPOINT_URL + path;
  }

  service.create = function(answer, token) {
    return $http({
        url: getUrl(),
        method: 'POST',
        data: JSON.stringify(answer),
        headers: {
            'Authorization': token
        }
     });
  };
  
  service.all = function(userID, token) {
    return $http.get(getUrl()+'?filter[where][userID]='+userID+'&filter[where][original]=true',{
        params: { access_token: token }
    });
  };
  service.checkTest = function(userId, createDate, token) {
    return $http.get(getUrl()+
        '?filter[where][userID]='+userId+
        '&filter[where][createDate]='+createDate +
        '&filter[fields][employerId]=true',{
      params: { access_token: token }
    });
  };
  service.allByTestId = function(testId, token) {
    return $http.get(getUrl()+'?filter[where][id]='+testId,{
        params: { access_token: token }
    });
  };
  service.allByEmployerId = function(date, limit, nextPage, employerId, token) {
    return $http({
      url: getUrl()+'page',
      method: 'POST',
      data: {
        'date': date,
        'limit': limit,
        'filters': {
          'where': {
            'employerId': '56a7cdbf64ed9a170491cc2f'
          },
          'order': 'createDate DESC'
        },
        'nextPage': nextPage,
        'unique': 'userID'
      },
      headers: {
          'Authorization': token,
          'Content-Type':'application/json'
      }
    });
  };
  service.allBySharedId = function(date, limit, nextPage, employerId, token, userId) {
    return $http({
      url: getUrl()+'page',
      method: 'POST',
      data: {
        'date': date,
        'limit': limit,
        'filters': {
          'where': {
            'employerId': '56a7cdbf64ed9a170491cc2f',
            'userID': userId
          },
          'order': 'createDate DESC'
        },
        'nextPage': nextPage
      },
      headers: {
          'Authorization': token,
          'Content-Type':'application/json'
      }
    });
  };

}])
.service('ServerEmployersService', ['$http', 'ENDPOINT_URL', 
function ($http, ENDPOINT_URL) {
  var service = this,
  path = 'Employers/';

  function getUrl() {
    return ENDPOINT_URL + path;
  }

  service.get = function(answer, token) {
    return $http({
        url: getUrl()+'?filter[where][active]=true',
        method: 'GET'
     });
  };
}]);