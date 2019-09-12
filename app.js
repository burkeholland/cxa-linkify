let WTifyApp = angular.module("WTify", []);

WTifyApp.controller("PopupController", function (
    $scope,
    ChromeFunctions,
    LinkService
) {
    $scope.originalUrl = "https://www.google.com";
    $scope.config = {
        props: ["event", "channel", "alias"]
    };
    $scope.activeTab = 0;
    $scope.presets = presets;

    /* These three functions are called when the extension is opened */

    // 1. Gets the last stored alias, event and channel from local storage
    ChromeFunctions.getConfiguration($scope.config.props).then(result => {
        $scope.config.values = result;
    });

    // 3. Prefills the input with the URL of the current page
    ChromeFunctions.getCurrentUrl().then(result => {
        $scope.originalUrl = result;
    });

    /* */

    $scope.saveConfiguration = function () {
        chrome.storage.sync.set($scope.config.values);
        chrome.storage.sync.set({ 'activeTab': $scope.activeTab });
    };

    $scope.shortenUrl = function () {
        $scope.status = "Shortening...";
        const trackedUrl = LinkService.track(this.originalUrl, this.config);
        LinkService.shorten(trackedUrl)
            .then(result => {
                ChromeFunctions.copyToClipboard(result);
                window.close();
            })
            .catch(() => {
                $scope.status = "FAILED";
            });
    };

    $scope.trackUrl = function () {
        const trackedUrl = LinkService.track(this.originalUrl, this.config);
        ChromeFunctions.copyToClipboard(trackedUrl);
        window.close();
    };

    $scope.setActiveTab = function (newTab) {
        $scope.activeTab = newTab;
        $scope.saveConfiguration();
    }

    $scope.isActiveTab = function (tabNum) {
        return $scope.activeTab === tabNum;
    };

    $scope.setPreset = function (channel, event) {
        $scope.config.values['channel'] = channel;
        $scope.config.values['event'] = event;
        $scope.activeTab = 0;
        $scope.saveConfiguration();
    }
});

WTifyApp.service("LinkService", function ($q, $http) {
    const API_URL = "https://cda.ms/save";
    const WEBTRENDS = "WT.mc_id=";

    return {
        track(url, config) {
            var separator =
                (url = url.replace(
                    /microsoft.com\/\w{2}-\w{2}\//g,
                    "microsoft.com/"
                )).indexOf("?") > 0
                    ? "&"
                    : "?",
                fragment = "",
                hashIndex = url.indexOf("#");
            -1 != hashIndex &&
                ((fragment = url.substr(hashIndex)), (url = url.replace(fragment, "")));

            let wtUrl = `${url}${separator}${WEBTRENDS}`;

            // add in the tracking details
            config.props.forEach((prop, index) => {
                wtUrl = `${wtUrl}${config.values[prop]}`;
                index < config.props.length - 1 && (wtUrl += "-");
            });

            return wtUrl + fragment;
        },

        shorten(url) {
            const defer = $q.defer();
            $http({
                method: "POST",
                url: API_URL,
                data: JSON.stringify({
                    url: url
                }),
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            }).then(result => {
                defer.resolve(result.data.url);
            });

            return defer.promise;
        }
    };
});

WTifyApp.factory("ChromeFunctions", function ($q) {
    return {
        getConfiguration(props) {
            const defer = $q.defer();
            chrome.storage.sync.get(props, result => {
                defer.resolve(result);
            });

            return defer.promise;
        },

        getCurrentUrl() {
            const defer = $q.defer();

            chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
                defer.resolve(tabs[0].url);
            });

            return defer.promise;
        },

        setValue(key, value) {
            chrome.storage.sync.set({ key, value });
        },

        copyToClipboard(url) {
            const input = document.createElement("input");
            input.style.position = "fixed";
            input.style.opacity = "0";
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand("Copy");
            document.body.removeChild(input);
        }
    };
});

// PRESETS
const presets = [
    {
        "name": "Social",
        "channel": "social",
        "description": "Channel is set to 'social'",
        "presets": [
            {
                "name": "Twitter",
                "icon": "fa-twitter",
                "event": "twitter"
            },
            {
                "name": "LinkedIn",
                "icon": "fa-linkedin",
                "event": "linkedin"
            },
            {
                "name": "Reddit",
                "icon": "fa-reddit",
                "event": "reddit"
            },
            {
                "name": "Facebook",
                "icon": "fa-facebook",
                "event": "facebook"
            },
            {
                "name": "StackOverflow",
                "icon": "fa-stack-overflow",
                "event": "stackoverlow"
            },
            {
                "name": "Hacker News",
                "icon": "fa-hacker-news-square",
                "event": "hackernews"
            }
        ]
    },
    {
        "name": "Blog",
        "channel": "blog",
        "description": "Channel is set to 'blog'",
        "presets": [
            {
                "name": "Medium",
                "icon": "fa-medium",
                "event": "medium"
            },
            {
                "name": "Azure Medium",
                "icon": "fa-medium",
                "style": "color: #326699",
                "event": "azuremedium"
            },
            {
                "name": "DevTo",
                "icon": "fa-dev",
                "event": "devto"
            },
            {
                "name": "IT Ops Talk",
                "icon": "fa-windows",
                "event": "itopstalk"
            }
        ]
    },
    {
        "name": "Other",
        "channel": "event",
        "description": "Channel is set to 'event'",
        "presets": [
            {
                "name": "YouTube",
                "icon": "fa-youtube",
                "event": "youtube"
            },
            {
                "name": "Github",
                "icon": "fa-github",
                "event": "github"
            }
        ]
    }
];