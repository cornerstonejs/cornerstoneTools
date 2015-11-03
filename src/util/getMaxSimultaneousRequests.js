(function(cornerstone, cornerstoneTools) {

    'use strict';

    // Maximum concurrent connections to the same server
    // Information from http://sgdev-blog.blogspot.fr/2014/01/maximum-concurrent-connection-to-same.html
    var maxSimultaneousRequests = {
        default: 6,
        IE: {
            9: 6,
            10: 8,
            default: 8
        },
        Firefox: {
            default: 6
        },
        Opera: {
            10: 8,
            11: 6,
            12: 6,
            default: 6
        },
        Chrome: {
            default: 6
        },
        Safari: {
            default: 4
        }
    };

    // Browser name / version detection
    // http://stackoverflow.com/questions/2400935/browser-detection-in-javascript
    function getBrowserInfo() {
        var ua = navigator.userAgent,
            M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [],
            tem;
        
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE ' + (tem[1] || '');
        }

        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem !== null) {
                return tem.slice(1).join(' ').replace('OPR', 'Opera');
            }
        }

        M = M[2]? [ M[1], M[2] ]: [ navigator.appName, navigator.appVersion, '-?' ];
        if ((tem = ua.match(/version\/(\d+)/i)) !== null) {
            M.splice(1, 1, tem[1]);
        }

        return M.join(' ');
    }

    function getMaxSimultaneousRequests() {
        var config = cornerstoneTools.stackPrefetch.getConfiguration();

        // Give preference to user-chosen values
        if (config.maxSimultaneousRequests) {
            return config.maxSimultaneousRequests;
        }

        var infoString = getBrowserInfo();
        var info = infoString.split(' ');
        var browserName = info[0];
        var browserVersion = info[1];
        var browserData = maxSimultaneousRequests[browserName];

        if (!browserData) {
            return maxSimultaneousRequests['default'];
        }

        if (!browserData[browserVersion]) {
            return browserData['default'];
        }

        return browserData[browserVersion];
    }

    // module exports
    cornerstoneTools.getMaxSimultaneousRequests = getMaxSimultaneousRequests;
    cornerstoneTools.getBrowserInfo = getBrowserInfo;

})(cornerstone, cornerstoneTools);
