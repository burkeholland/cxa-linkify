# CxA-Linkify

A Chrome Extension that allows for the simple creation and shortening of links so that they conform to the WebTrends standard.

## Installing the extension

1. Clone this repo

2. Navigate to `chrome://extensions` in Google Chrome and toggle on "Developer Mode"

3. Select "Load Unpacked Extension" and choose the folder where you cloned this repo

## How to use

The extension populates the current url of whatever page you are currently on. Add in the correct event, channel and alias information. Note that it's optional to include an event or channel.

Clicking the "Track" button will modify the URL of the current page to work with Web Trends and copy it to your clipboard. The extension automatically closes.

Clicking the "Shorten" button will first modify the URL of the current page to work with Web Trends and then will shorten the link using the `cda.ms` shortener service. The shortened link will then be copied to the clipboard and the extension automatically closes.
