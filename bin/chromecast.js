#!/usr/bin/env node
/**
 * chromecast commandline utility.
 *
 * @since 0.0.1
 */
'use strict';

var fs = require('fs');
var chalk = require('chalk');
var error = chalk.bold.red;

console.log("Looking for MP3 files...");

var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var mdns = require('mdns');
var ip = require('ip');

// start it up
Chromecast();

// cut and pasted junk

function Chromecast() {
  var browser = mdns.createBrowser(mdns.tcp('googlecast'));

  browser.on('serviceUp', function(service) {
    console.log('Found device "%s" at %s:%d', service.name, service.addresses[0], service.port);
    ondeviceup(service.addresses[0]);
    browser.stop();
  });

  browser.start();

  serveMusic('Shades Of Indigo.mp3', 8888);

  function ondeviceup(host) {

    var client = new Client();

    client.connect(host, function() {
      console.log('connected, launching app ...');

      client.launch(DefaultMediaReceiver, function(err, player) {
        if (err) {
          console.error('Error: %s', err.message);
          client.close();
          return;
        }

        var media = {
          contentId: 'http://' + ip.address() + ':' + 8888,
          contentType: 'audio/mpeg3',
          streamType: 'LIVE', // or LIVE

          // Title and cover displayed while buffering
          metadata: {
            type: 0,
            metadataType: 0,
            title: "test title!"
          }        
        };

        player.on('status', function(status) {
          console.log('status broadcast playerState=%s', status.playerState);
        });

        console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId);

        player.load(media, { autoplay: true }, function(err, status) {
          if (err) {
            console.error('Error: %s', err.message);
            client.close();
            return;
          }
          console.log('media loaded playerState=%s', status.playerState);
        });
      });

    });

    client.on('error', function(err) {
      console.error('Error: %s', err.message);
      client.close();
    });

  }
}

// random functions that should probably be elsewhere

function serveMusic(filePath, port) {
    var http = require('http'),
        fs   = require('fs'),
        stat = fs.statSync(filePath);

    http.createServer(function(request, response) {

        response.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': stat.size
        });

        fs.createReadStream(filePath).pipe(response);
    })
    .listen(port);
}