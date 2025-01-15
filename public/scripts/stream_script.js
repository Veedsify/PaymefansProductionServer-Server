let meeting;
const socket = io();
let count = 0;
socket.emit("connect-stream", {
  userId: userId,
  streamId: streamId,
});

socket.on("stream-connected", (data) => {
  count = data.count;
  $('[data-attr="views"]').html(data.count);
});


// DOM Elements
const devicesElement = document.querySelector("[data-attr='devices']");
const enableVideoButton = document.querySelector("[data-attr='video-toggle']");
const enableAudioButton = document.querySelector("[data-attr='audio-toggle']");
const videoElem = document.getElementById('video-element');
devicesElement.addEventListener("change", selectVideoDevice);
enableVideoButton.addEventListener("click", enableAndDisableVideo);
enableAudioButton.addEventListener("click", enableandDisableAudio);
document.addEventListener("DOMContentLoaded", init);



async function init() {
  try {
    meeting = await DyteClient.init({
      authToken: AuthToken,
      defaults: {
        video: true,
        mediaConfiguration: {
          video: {
            width: { ideal: 720 },
            height: { ideal: 1280 },
          },
        },
        audio: false,
      }
    });

    await meeting.join();

    // console.log(meeting.self);

    meeting.self.on('roomJoined', () => {
      console.log(
        'User has joined the meeting and ready to produce and consume media'
      );
    });

    playVideo();
    getVideoDevices()
  } catch (error) {
    console.error(error);
  }
}

async function selectVideoDevice(e) {
  const deviceId = e.target.value;
  await meeting.self.setDevice(deviceId);
  console.log("Device set");
}

async function getVideoDevices() {
  const videoDevices = await meeting.self.getVideoDevices();
  const audioDevices = await meeting.self.getAudioDevices();
  const speakerDevices = await meeting.self.getSpeakerDevices();
  videoDevices.forEach((device) => {
    const option = document.createElement("option");
    option.value = device.deviceId;
    option.innerText = device.label;
    devicesElement.append(option);
  });
}

async function playVideo() {
  if (videoElem) {
    meeting.self.on('videoUpdate', async ({ videoEnabled, videoTrack }) => {
      if (videoEnabled) {
        const stream = new MediaStream();
        stream.addTrack(videoTrack);
        console.log(stream);
        videoElem.srcObject = stream;
        videoElem.play();
      } else {
        videoElem.pause();
      }
    });
  }
}


let videoEnabled = true;
let audioEnabled = true;

async function enableAndDisableVideo() {
  if (videoEnabled) {
    await meeting.self.disableVideo();
    videoEnabled = false;
    return
  }
  await meeting.self.enableVideo();
  videoEnabled = true;
  console.log("Video enabled");
}

async function enableandDisableAudio() {
  if (audioEnabled) {
    await meeting.self.disableAudio();
    audioEnabled = false;
    return
  }
  await meeting.self.enableAudio();
  audioEnabled = true;
  console.log("Audio enabled");
}
