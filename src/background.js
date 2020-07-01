/* global chrome, MediaRecorder, FileReader */

let recorder = null;
let filename = null;
const desktopMedia = ['tab', 'audio'];
chrome.runtime.onConnect.addListener(port => {

  port.onMessage.addListener(msg => {
    console.log(msg);
    switch (msg.type) {
      case 'SET_EXPORT_PATH':
        filename = msg.filename
        break
      case 'REC_STOP':
        try {
          recorder.stop()
        }catch (e) {
          console.log(e);
        }
        break;
      case 'REC_CLIENT_PLAY':
        if(recorder){
          return
        }
        const tab = port.sender.tab
        tab.url = msg.data.url
        // chrome.desktopCapture.chooseDesktopMedia(desktopMedia, (id, options) => {
        //   console.log({id, options});
          chrome.desktopCapture.chooseDesktopMedia( desktopMedia, (streamId, streamOptions) => {
            console.log({streamOptions})
            console.log({streamId})
            navigator.webkitGetUserMedia({
              audio: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: streamId
                }
              },
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: streamId
                }
              }
            }, stream => {
              var chunks=[];
              recorder = new MediaRecorder(stream, {
                mimeType: 'video/webm',
              });
              recorder.ondataavailable = function (event) {
                console.log({event})
                if (event.data.size > 0) {
                  chunks.push(event.data);
                }
              };

              recorder.onstop = function () {
                var superBuffer = new Blob(chunks, {
                  type: 'video/webm'
                });

                var url = URL.createObjectURL(superBuffer);
                chrome.downloads.download({
                  url: url,
                  filename: filename
                });
              }

              recorder.start();
            }, error => console.log('Unable to get user media', error))
          })
        // })
        break
      default:
        console.log('Unrecognized message', msg)
    }
  })

  chrome.downloads.onChanged.addListener(function(delta) {
    if (!delta.state ||(delta.state.current != 'complete')) {
      return;
    }
    try{
      port.postMessage({downloadComplete: true})
    }
    catch(e){}
  });

})