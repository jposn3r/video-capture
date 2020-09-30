const { desktopCapturer, remote } = require('electron')
const { writeFile } = require('fs')
const { Menu, dialog } = remote

const startButton = document.getElementById("startButton")
const stopButton = document.getElementById("stopButton")
const videoSelectButton = document.getElementById("videoSelectButton")
videoSelectButton.onclick = getVideoSources
startButton.onclick = startRecording
stopButton.onclick = stopRecording

const video = document.querySelector("video")
let mediaPlayer
var mediaRecorder
const recordedChunks = []

function startRecording() {
    if (mediaRecorder === undefined) {
        console.log("undefined media recorder")
    } else {
        console.log("start recording")
        mediaRecorder.start();
        startButton.classList.add('is-danger');
        startButton.innerText = 'Recording';
    }
}

function stopRecording() {
    if (mediaRecorder === undefined) {
        console.log("undefined media recorder")
    } else {
        console.log("stop recording")
        mediaRecorder.stop();
        startButton.classList.remove('is-danger');
        startButton.innerText = 'Start';
    }
}

async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    })

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map((source) => {
            return {
                label: source.name,
                click: () => selectVideoSource(source)
            }
        })
    )
    videoOptionsMenu.popup([])
}

async function selectVideoSource(source) {
    videoSelectButton.innerText = source.name

    const constraints = {
        audio:false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    }

    const stream = await navigator.mediaDevices
        .getUserMedia(constraints);

    video.srcObject = stream
    video.play()

    const options = { mimeType: 'video/webm; codecs=vp9' }
    mediaRecorder = new MediaRecorder(stream, options)
    mediaRecorder.ondataavailable = handleDataAvailable
    mediaRecorder.onstop = saveVideoChunksOnStop
}

function handleDataAvailable(e) {
    console.log("video data available: " + e.data)
    recordedChunks.push(e.data)
}

async function saveVideoChunksOnStop(e) {
    console.log("saveVideoFromChunks() running")
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
    })

    const buffer = Buffer.from(await blob.arrayBuffer())
    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: "Save video",
        defaultPath: `vid-${Date.now()}.webm`
    })
    if(filePath !== undefined && filePath !== "") {
        console.log(filePath)

        writeFile(filePath, buffer, () => console.log("video saved successfully!"))
    } else {
        console.log("Operation terminated, file not saved..")
    }
}
