const startButton = document.getElementById("startButton")
const stopButton = document.getElementById("stopButton")
const videoSelectButton = document.getElementById("videoSelectButton")
videoSelectButton.onclick = getVideoSources
const video = document.querySelector("video")

const { desktopCapturer} = require('electron')
const { Menu } = remote

async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    })

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            }
        })
    )
    videoOptionsMenu.popUp()
}
