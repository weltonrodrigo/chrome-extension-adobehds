
/*
 *
 * This extension is based on AdobeHDS Link Detector Firefox complement.
 * https://addons.mozilla.org/pt-BR/firefox/addon/hds-link-detector/?src=api
 *
 */

var endpointUrl = "http://ec2-nutel.duckdns.org:8080/hello"

var manifestUrl = false;
var manifestDetected = false;

var disciplina;
var aula;
var nextAula;

// ID of the tab where my content script is running;
var tabID;

/*
* After the manifest is downloaded, this function is called when the player will get the first video 
* fragment. This is needed to get authentication information which the player derives from is key.
*/
function onSendHeaders(details)
{
    //console.log("onSendHeaders: " + details.url);
    if (manifestDetected && manifestUrl)
    {
        var fullUrl = details.url
        var url = fullUrl;
        var headers = details.requestHeaders;

        var userAgent = findUserAgent(headers);

        //console.log("onSendHeaders: " + userAgent);

        if (url.indexOf("?") != -1) url = url.substr(0, url.indexOf("?"));
        if (url.search(/seg\d+\-frag\d+$/i) != -1)
        {
            var command = "php AdobeHDS.php --manifest \"" + manifestUrl + "\" --delete";
            var authParams = false;

            if (fullUrl.indexOf("?") != -1) authParams = fullUrl.substr(fullUrl.indexOf("?") + 1);
            
            if (authParams)
            {
                command += " --auth \"" + authParams + "\"";
            }
            if (userAgent)
            {
                command += " --useragent \"" + userAgent + "\"";          
            }

            console.dir(command);

            queueDownload(manifestUrl, authParams, userAgent);

            manifestDetected = false;
            manifestUrl = false;
        }
    }
}

/*
* Get addition information about this class. 
*/
function getClassDetails(callback){

    chrome.tabs.sendMessage(tabID, {
                command: 'get_details',
            }, function (response) {
                if (chrome.runtime.lastError) {
                    console.log('ERROR: ' + chrome.runtime.lastError.message);
                } else {
                    callback(response);
                }
            });
}

/*
* Tell content script to change tab URL to the next class URL;
*/
function goToNextClass(){
    if (typeof nextAula == undefined){
        console.log("Can't go past the last class");
    }else{
        chrome.tabs.update(tabID, {url: nextAula});
    }
}

function logOnContentScript(message){
    chrome.tabs.sendMessage(tabID, {command: "log", message: message});
}

function queueDownload(manifestURL, authParams, userAgent){

    var data = new FormData();
    
    data.append('disciplina', disciplina);
    data.append('aula', aula);
    data.append('manifest', manifestUrl);
    data.append('auth', authParams);
    data.append('ua', userAgent);

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            logOnContentScript("Download finished");
            setTimeout(function(){  goToNextClass()  }, 5000);
        }
    }
    xhr.open('POST', endpointUrl, false);
    //xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(data);


}

function findUserAgent(headers)
{
    a = headers.filter(function(el){
        return el.name === 'User-Agent'
    });

    if (a.length > 0){
        return a[0].value;
    }

    return false;
}

/*
* This will try to get manifest URL from a request.
*/
function onCompleted(details)
{
    //console.log("onCompleted: " + details.url);
    if (!manifestUrl && !manifestDetected)
    {
        var fullUrl = details.url;

        var url = fullUrl;
        if (url.indexOf("?") != -1) url = url.substr(0, url.indexOf("?"));
        if (url.search(/\.f4m$/i) != -1)
        {
            manifestDetected = true;
            manifestUrl = fullUrl;

            //var newListener = new TracingListener();
            //event.subject.QueryInterface(Ci.nsITraceableChannel);
            //newListener.originalListener = event.subject.setNewListener(newListener);
        }
    }
}

/*
function CCIN(cName, ifaceName)
{
    return Cc[cName].createInstance(Ci[ifaceName]);
}
*/

/*
 * There is no way right now (april-2015) to read response body from a chrome extension
 * without using developer tools.
 * So, this may be broke, because we won't check if the manifest is valid.

 * TODO: Get manifest via XMLHTTP (if possible) and parse it.
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
*/



chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    
    switch(request.command){
        case "register":
            // TODO: find a way to deregister the content-script;
            tabID = sender.tab.id;

            aula = request.aula;
            disciplina = request.disciplina;
            nextAula = request.nextAula;

            // TODO: Check if blocking is really needed.
            chrome.webRequest.onSendHeaders.addListener(onSendHeaders, {urls: ["<all_urls>"]}, ["requestHeaders"]);
            chrome.webRequest.onCompleted.addListener(onCompleted, {urls: ["<all_urls>"]}, ["responseHeaders"]);
            
            sendResponse({result : "OK"});
            break;
    }

  });
