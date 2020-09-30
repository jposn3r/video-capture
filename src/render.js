const { desktopCapturer, remote } = require('electron')
const { Menu } = remote
const startButton = document.getElementById("startButton")
const stopButton = document.getElementById("stopButton")
const videoSelectButton = document.getElementById("videoSelectButton")
videoSelectButton.onclick = getVideoSources
const video = document.querySelector("video")

async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    })

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectVideoSource(source)
            }
        })
    )
    videoOptionsMenu.popup([])
}

async function selectVideoSource(source) {
    videoSelectButton.text = source.name

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
}
