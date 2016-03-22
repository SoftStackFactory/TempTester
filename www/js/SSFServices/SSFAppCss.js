/* Changes the colors of the app.
Instructions:
1.  Inject 'SSFAppCss' into the app.js file before any of the other SSFServices.
2.  Place '<script src="js/SSFServices/SSFAppCss.js"></script>' into the index.html
            file above the app.js.
3.  If you have not already, include SSFConfig.js and place the following .config
            block of code inside of it.
.config(['SSFConfigConstants', function(SSFConfigConstants) {
  //SSF Colors
	SSFConfigConstants['SSFAppCssService'] = {
		'buttonPrimary': '#A34D24',
		'buttonSecondary': '#808285',
		'header': '#EB7C23'
	};
}])
4.  Add the following classes to the class="" to your html:
        buttonPrimary: app-button
        buttonSecondary: app-button-inverted
        header: app-header
*/

angular.module('SSFAppCss', [])


.service('SSFAppCssService', ['$window', 'SSFConfigConstants', function($window, SSFConfigConstants) {
	var service = this;
	var defaultCss = SSFConfigConstants.SSFAppCssService;
	
	
	service.setCss = function(buttonPrimary, buttonSecondary, header, storeCss) {
		var cssObject = {};
		cssObject.buttonPrimary = buttonPrimary !== undefined ? buttonPrimary : defaultCss.buttonPrimary;
		cssObject.buttonSecondary = buttonSecondary !== undefined ? buttonSecondary : defaultCss.buttonSecondary;
		cssObject.header = header !== undefined ? header : defaultCss.header;
		var sheet = window.document.styleSheets[0];
		for(var i = sheet.rules.length - 1; i > 0; i--) {
			if(sheet.rules[i].cssText.slice(0, 5) === '.app-') {
				sheet.deleteRule(i); //does not delete css loaded via file
			}
		}
		if(storeCss === undefined || storeCss)
			$window.localStorage['appCss'] = JSON.stringify(cssObject);
		sheet.insertRule(
			'.app-button {' +
				'font-weight: bold !important;' + 
				'background-color: ' + cssObject.buttonPrimary + ' !important;' + 
			'}', sheet.cssRules.length);
		sheet.insertRule(
			'.app-button-inverted {' + 
				'font-weight: bold !important;' + 
				'background-color: ' + cssObject.buttonSecondary + ' !important;' + 
			'}', sheet.cssRules.length);
		sheet.insertRule(
			'.app-bar-header {' + 
				'background-color: ' + cssObject.header + ' !important;' + 
			'}', sheet.cssRules.length);
		sheet.insertRule(
			'.app-tabs {' + 
				'font-weight: bold !important;' + 
				'background-color: ' + cssObject.buttonPrimary + ' !important;' + 
			'}', sheet.cssRules.length);
		sheet.insertRule(
			'.checkbox-calm .checkbox-icon:before {' +
				'border-color: ' + cssObject.buttonPrimary + ' !important;' +
			'}', sheet.cssRules.length);
	};

}])
.run(['SSFConfigConstants', '$window',
		function(SSFConfigConstants, $window) {
	var company = $window.localStorage['appCss'] === undefined ? SSFConfigConstants.SSFAppCssService : JSON.parse($window.localStorage['appCss']);
  var sheet = window.document.styleSheets[0];
  sheet.insertRule(
    '.app-button {' +
			'font-weight: bold !important;' +
			'background-color: ' + company.buttonPrimary + ' !important;' +
    '}', sheet.cssRules.length);
  sheet.insertRule(
    '.app-button-inverted {' +
			'font-weight: bold !important;' +
			'background-color: ' + company.buttonSecondary + ' !important;' +
    '}', sheet.cssRules.length);
  sheet.insertRule(
    '.app-bar-header {' +
			'background-color: ' + company.header + ' !important;' +
    '}', sheet.cssRules.length);
  sheet.insertRule(
    '.app-tabs {' +
			'font-weight: bold !important;' +
			'background-color: ' + company.buttonPrimary + ' !important;' +
    '}', sheet.cssRules.length);
  sheet.insertRule(
    '.checkbox input:checked:before, .checkbox input:checked + .checkbox-icon:before {' +
			'background: ' + company.buttonPrimary + ' !important;' +
			'border-color: ' + company.buttonPrimary + ' !important;' +
    '}', sheet.cssRules.length);
	sheet.insertRule(
		'.checkbox-calm .checkbox-icon:before {' +
			'border-color: ' + company.buttonPrimary + ' !important;' +
		'}', sheet.cssRules.length);
}]);