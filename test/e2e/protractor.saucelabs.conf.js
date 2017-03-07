// See:
// https://github.com/angular/protractor/blob/master/lib/config.ts
// https://www.ignoredbydinosaurs.com/posts/257-angular-protractor-tests-and-sauce-connect-config
// https://github.com/esvit/ng-table/blob/master/e2e/protractor-travis.config.js

exports.config = {
    specs: [
        '*.spec.js'
    ],

    baseUrl: 'http://localhost:8000/',

    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY,

    allScriptsTimeout: 10000,

    getPageTimeout: 10000,

    multiCapabilities: [
        capabilitiesForSauceLabs({
            'name': 'Linux/Chrome',
            'browserName': 'chrome'
        }),
        capabilitiesForSauceLabs({
            'name': 'Linux/Firefox',
            'browserName': 'firefox'
        }),
        capabilitiesForSauceLabs({
            'name': 'Win7/Firefox',
            'browserName': 'firefox',
            'platform': 'Windows 7'
        }),
        capabilitiesForSauceLabs({
            'name': 'Win7/Chrome',
            'browserName': 'chrome',
            'platform': 'Windows 7'
        })
        ,
        capabilitiesForSauceLabs({
            'name': 'Win7/IE9',
            'browserName': 'internet explorer',
            'platform': 'Windows 7',
            'version': 9
        }),
        capabilitiesForSauceLabs({
            'name': 'Win8/IE10',
            'browserName': 'internet explorer',
            'platform': 'Windows 8',
            'version': 10
        }),
        capabilitiesForSauceLabs({
            'name': 'Win8.1/IE11',
            'browserName': 'internet explorer',
            'platform': 'Windows 8.1',
            'version': 11
        }),
        capabilitiesForSauceLabs({
            'name': 'Win10/Edge',
            'browserName': 'edge',
            'platform': 'Windows 10',
            'version': '13.10586'
        }),
        capabilitiesForSauceLabs({
            'name': 'Mac/Safari 8',
            'browserName': 'safari',
            'platform': 'OS X 10.10',
            'version': 8
        }),
        capabilitiesForSauceLabs({
            'name': 'Mac/Safari 9',
            'browserName': 'safari',
            'platform': 'OS X 10.11',
            'version': 9
        })
    ],

    framework: 'jasmine',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000,
        showColors: true,
        includeStackTrace: true
    }
};
