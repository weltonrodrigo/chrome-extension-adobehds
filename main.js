// The main module of the hds-link-detector Add-on.
// Modules needed are `require`d, similar to CommonJS modules.
var {Cc, Ci, Cr} = require('chrome');
var clipboard = require('sdk/clipboard');
var events = require("sdk/system/events");
var notifications = require("sdk/notifications");
var self = require("sdk/self");
var widget = require("sdk/widget");

var enabled = false;
var manifestUrl = false;
var hdsDisabled = self.data.url("hds_disabled.png");
var hdsEnabled = self.data.url("hds_enabled.png");

function onHttpRequest(event)
{
    if (manifestUrl)
    {
        var httpChannel = event.subject.QueryInterface(Ci.nsIHttpChannel);
        var fullUrl = httpChannel.URI.path;

        // Double slash in beginning of relative url causes resolve function to
        // return wrong absolute url
        if (fullUrl.substr(0, 2) == "//") fullUrl = fullUrl.substr(1);
        fullUrl = httpChannel.URI.resolve(fullUrl);

        var url = fullUrl;
        if (url.indexOf("?") != -1) url = url.substr(0, url.indexOf("?"));
        if (url.search(/seg\d+\-frag\d+$/i) != -1)
        {
            var command = "php AdobeHDS.php --manifest \"" + manifestUrl + "\" --delete";
            var authParams = false;

            if (fullUrl.indexOf("?") != -1) authParams = fullUrl.substr(fullUrl.indexOf("?") + 1);
            if (authParams)
            {
                var userAgent = httpChannel.getRequestHeader("User-Agent");
                command += " --auth \"" + authParams + "\" --useragent \"" + userAgent + "\"";
            }
            console.log(command);
            var trimmedCmd = command;
            if (trimmedCmd.length > 256) trimmedCmd = trimmedCmd.substr(0, 253) + "...";
            notifications.notify(
            {
                title: "Click to copy command to clipboard",
                text: trimmedCmd,
                iconURL: hdsEnabled,
                data: command,
                onClick: function (data)
                {
                    clipboard.set(data);
                }
            });
            manifestUrl = false;
        }
    }
}

function onHttpResponse(event)
{
    if (!manifestUrl)
    {
        var httpChannel = event.subject.QueryInterface(Ci.nsIHttpChannel);
        var fullUrl = httpChannel.URI.path;

        // Double slash in beginning of relative url causes resolve function to
        // return wrong absolute url
        if (fullUrl.substr(0, 2) == "//") fullUrl = fullUrl.substr(1);
        fullUrl = httpChannel.URI.resolve(fullUrl);

        var url = fullUrl;
        if (url.indexOf("?") != -1) url = url.substr(0, url.indexOf("?"));
        if (url.search(/\.f4m$/i) != -1)
        {
            manifestUrl = fullUrl;

            var newListener = new TracingListener();
            event.subject.QueryInterface(Ci.nsITraceableChannel);
            newListener.originalListener = event.subject.setNewListener(newListener);
        }
    }
}

function CCIN(cName, ifaceName)
{
    return Cc[cName].createInstance(Ci[ifaceName]);
}

// Copy response listener implementation

function TracingListener()
{
    this.originalListener = null;
    this.receivedData = "";

    this.onDataAvailable = function (request, context, inputStream, offset, count)
    {
        var binaryInputStream = CCIN("@mozilla.org/binaryinputstream;1", "nsIBinaryInputStream");
        var storageStream = CCIN("@mozilla.org/storagestream;1", "nsIStorageStream");
        var binaryOutputStream = CCIN("@mozilla.org/binaryoutputstream;1", "nsIBinaryOutputStream");

        binaryInputStream.setInputStream(inputStream);
        storageStream.init(8192, count, null);
        binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));

        // Copy received data
        var data = binaryInputStream.readBytes(count);
        this.receivedData += data;

        binaryOutputStream.writeBytes(data, count);

        this.originalListener.onDataAvailable(request, context, storageStream.newInputStream(0), offset, count);
    };

    this.onStartRequest = function (request, context)
    {
        this.originalListener.onStartRequest(request, context);
    };

    this.onStopRequest = function (request, context, statusCode)
    {
        console.log(this.receivedData);

        var xmlParser = CCIN("@mozilla.org/xmlextras/domparser;1", "nsIDOMParser");
        var xml = xmlParser.parseFromString(this.receivedData, "application/xml");
        if (xml.getElementsByTagName("parsererror")[0])
        {
            manifestUrl = false;
            console.log("Failed to parse xml");
        }
        else if (xml.getElementsByTagName("manifest")[0])
        {
            var manifest = xml.getElementsByTagName("manifest")[0];
            var href = manifest.getElementsByTagName("media")[0].getAttribute("href");
            var url = manifest.getElementsByTagName("media")[0].getAttribute("url");
            if (href)
            {
                console.log("Detected a set-level manifest: " + href);
            }
            else if (url)
            {
                console.log("Detected a stream-level manifest: " + url)
                if (url.indexOf("?") != -1) url = url.substr(0, url.indexOf("?"));
                if (url.search(/\.f4m$/i) != -1) manifestUrl = false;
            }
            else
            {
                manifestUrl = false;
            }
        }
        else
        {
            manifestUrl = false
        };

        this.originalListener.onStopRequest(request, context, statusCode);
    };

    this.QueryInterface = function (aIID)
    {
        if (aIID.equals(Ci.nsIStreamListener) || aIID.equals(Ci.nsISupports))
        {
            return this;
        }
        throw Cr.NS_NOINTERFACE;
    };
}

exports.main = function ()
{
    var myWidget = new widget.Widget(
    {
        // Mandatory string used to identify your widget in order to
        // save its location when the user moves it in the browser.
        // This string has to be unique and must not be changed over time.
        id: "hds-link-detector",

        // A required string description of the widget used for
        // accessibility, title bars, and error reporting.
        label: "HDS Link Detector",


        // An optional string URL to content to load into the widget.
        // This can be local content or remote content, an image or
        // web content. Widgets must have either the content property
        // or the contentURL property set.
        //
        // If the content is an image, it is automatically scaled to
        // be 16x16 pixels.
        contentURL: hdsDisabled,

        // Add a function to trigger when the Widget is clicked.
        onClick: function (event)
        {
            if (!enabled)
            {
                events.on('http-on-modify-request', onHttpRequest);
                events.on('http-on-examine-response', onHttpResponse);
                events.on('http-on-examine-cached-response', onHttpResponse);
                events.on('http-on-examine-merged-response', onHttpResponse);
                myWidget.contentURL = hdsEnabled;
                notifications.notify(
                {
                    title: "Enabled",
                    text: "HDS Link Detector is now enabled.",
                    iconURL: hdsEnabled
                });
                enabled = true;
            }
            else
            {
                events.off('http-on-modify-request', onHttpRequest);
                events.off('http-on-examine-response', onHttpResponse);
                events.off('http-on-examine-cached-response', onHttpResponse);
                events.off('http-on-examine-merged-response', onHttpResponse);
                myWidget.contentURL = hdsDisabled;
                notifications.notify(
                {
                    title: "Disabled",
                    text: "HDS Link Detector is now disabled.",
                    iconURL: hdsDisabled
                });
                enabled = false;
                manifestUrl = false;
            }
        }
    });
};
