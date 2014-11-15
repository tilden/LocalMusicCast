// This is the main file, it runs all the magic.

// Top-level variables
var tcpServer;
var commandWindow;

var DEFAULT_WINDOW_POS = {
    width: 500, height: 500, left: 0
}

// Main runner
chrome.app.runtime.onLaunched.addListener(function(launchData) {
    if (commandWindow && !commandWindow.contentWindow.closed) {
        // If the current window exists, focus it.
		commandWindow.focus();
	} else {
        // Otherwise build the new one!
		chrome.app.window.create('index.html',
			{
                id: "main-window", 
                innerBounds: DEFAULT_WINDOW_POS
            },
			function(window_handler) {
				commandWindow = window_handler;
                window_handler.contentWindow.launchData = launchData;
			});
	}
});

// event logger
var log = (function(){
  var logLines = [];
  var logListener = null;

  var output=function(str) {
    if (str.length>0 && str.charAt(str.length-1)!='\n') {
      str+='\n'
    }
    logLines.push(str);
    if (logListener) {
      logListener(str);
    }
  };

  var addListener=function(listener) {
    logListener=listener;
    // let's call the new listener with all the old log lines
    for (var i=0; i<logLines.length; i++) {
      logListener(logLines[i]);
    }
  };

  return {output: output, addListener: addListener};
})();

// Main callback accept
function onAcceptCallback(tcpConnection, socketInfo) {
  var info="["+socketInfo.peerAddress+":"+socketInfo.peerPort+"] Connection accepted!";
  log.output(info);
  console.log(socketInfo);
  tcpConnection.addDataReceivedListener(function(data) {
    var lines = data.split(/[\n\r]+/);
    for (var i=0; i<lines.length; i++) {
      var line=lines[i];
      if (line.length>0) {
        var info="["+socketInfo.peerAddress+":"+socketInfo.peerPort+"] "+line;
        log.output(info);

        var cmd=line.split(/\s+/);
        try {
          tcpConnection.sendMessage(Commands.run(cmd[0], cmd.slice(1)));
        } catch (ex) {
          tcpConnection.sendMessage(ex);
        }
      }
    }
  });
};

// Start the server
function startServer(addr, port) {
  if (tcpServer) {
    tcpServer.disconnect();
  }
  tcpServer = new TcpServer(addr, port);
  tcpServer.listen(onAcceptCallback);
}

// Stop the server
function stopServer() {
  if (tcpServer) {
    tcpServer.disconnect();
    tcpServer=null;
  }
}

// Check the current state of the server
function getServerState() {
  if (tcpServer) {
    return {isConnected: tcpServer.isConnected(),
      addr: tcpServer.addr,
      port: tcpServer.port};
  } else {
    return {isConnected: false};
  }
}
