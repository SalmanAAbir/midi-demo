import { getRenderer } from "./Rendering/Render.js"
import { getUI } from "./ui/UI.js"
import { InputListeners } from "./InputListeners.js"
import { getPlayer, initThePlayer } from "./player/Player.js"
import { getURLParams, loadJson } from "./Util.js"
import { getLoader } from "./ui/Loader.js"
import { initLandingPage } from "../LandingPageGenerator.js"
import { getSongsFromDb, saveSongInDb } from "./settings/IndexDbHandler.js"
import { initSettings } from "./settings/Settings.js"
import { getPresetHandler } from "./settings/ParticlePreset.js"
import { initShaders } from "./Rendering/ThreeJs/Shader.js"
import { getSongSettings } from "./settings/SongSettings.js"
import { FileLoader } from "./player/FileLoader.js"
import { getTracks } from "./player/Tracks.js"
/**
 *Bugs:
 whats happening in measure 62 in kv331 1st.  
 *memory leak audioNotes 
 *changing zDistibution of particleType and then changing amount which causes shaders to be reset causes some error in three.js
 * TODOs:
 *
 * - implement different modes:
 * 		- normal
 * 		- play along
 * 			- wait to hit right note (score in seconds / mistakes)
 * 			- own speed -> notes play as soon as key is hit (score in seconds / mistakes)
 * 			- rythm -> no waiting score accuracy
 * 		- scale training
 * 			- recognize scale
 * 			- play in scale
 *		- by ear
			- note
			- chords
			- melody
 * UI:
 * - Add Back/Forward History + add button to about page on app
 * - Mobile 
 * - channel menu
 * - Fix fullscreen on mobile
 *
 * Audio 
 * - implement control messages for
 * 		- sostenuto pedal
 * 			- only keys that are pressed while pedal is hit are sustained
 * 		- soft pedal
 * 			- how does that affect sound?
 * - implement pitch shift
 * - settings for playalong:
 * 		- accuracy needed
 * 		- different modes
 * 
 * 
 * 
 *
 *
 *
 * 
 */
let loading
let allSongNames = {}
let dbSongs = {}

if ("serviceWorker" in navigator) {
	window.addEventListener("load", function () {
		navigator.serviceWorker
			.register("/serviceWorker.js")
			.then(res => console.log("Service worker registered"))
			.catch(err => console.log("Service worker not registered", err))
	})
}

window.onload = function () {
	let urlParams = getURLParams()

	if (urlParams.has("songUrl") || urlParams.has("app")) {
		tapToStart()
	} else {
		// history.pushState({ page: 1 }, "Start", "")
	}

	initLandingPage(
		document.querySelector("#lpTop"),
		document.querySelector("#lpContentWrapper"),
		tapToStart
	)
}

async function init() {
	initThePlayer()
	getRenderer()
	await initShaders()
	getUI()
	initSettings()
	new InputListeners()
	renderLoop()

	getPresetHandler()

	await loadJson("./js/data/exampleSongs.json", json => {
		getUI().setExampleSongs(JSON.parse(json))
	})
	getSongsFromDb().then(ab => {
		ab.onsuccess = ev => {
			let dbSongs = ev.target.result
			getUI().setDbSongs(dbSongs)

			getSongSettings().setDbSongs(dbSongs)
		}
		ab.onerror = ev => {
			console.log(
				"Error getting saved songs from IndexedDB: " + ev.target.error
			)
		}
	})

	startStartingSong()
}
async function startStartingSong() {
	let urlParams = getURLParams()
	let urlHasStartingSong = false
	let startingSongSuccessLoaded = false
	if (urlParams.has("songUrl")) {
		const url = urlParams.get("songUrl")
		urlHasStartingSong = true
		let name = undefined
		if (urlParams.has("songName")) {
			name = urlParams.get("songName")
		}
		let fileName = getFileNameFromUrl(url)
		if (getUI().songUI.songDivs.hasOwnProperty(fileName)) {
			console.log("External song already exists. Loading existing instead.")
			getUI().songUI.songDivs[fileName].button.click()

			startingSongSuccessLoaded = true
		} else {
			startingSongSuccessLoaded = await loadUrlSong(url, name)
		}
	}
	if (!urlHasStartingSong || !startingSongSuccessLoaded) {
		let songDivs = getUI().songUI.songDivs
		let songAmount = Object.keys(songDivs).length

		let counter = Math.floor(Math.random() * songAmount)
		let key = Object.keys(songDivs)[counter]
		let songDiv = songDivs[key]
		songDiv.button.click()
	}
}
async function tapToStart() {
	document.querySelector("#landingPage").style.opacity = "0"
	window.setTimeout(() => {
		document.querySelector("#landingPage").style.display = "none"
	}, 500)
	document.body.style.backgroundColor = "rgba(0,0,0,0)"

	getLoader().startLoad()
	await init()

	// history.pushState({ page: 2 }, "App", "/?app")

	loading = true
}

function renderLoop() {
	try {
		getRenderer().render()
	} catch (e) {
		console.error(e)
	}
	window.requestAnimationFrame(renderLoop)
}
async function loadUrlSong(url, name) {
	let isSuccess = false
	let response = await FileLoader.loadSongFromURL(url, name)
	let fileName = getFileNameFromUrl(url)

	try {
		await getPlayer().loadSong(
			response,
			{
				fileName,
				name: name || fileName
			},
			true
		)
		saveSongInDb({
			fileName,
			name: name || fileName,
			midiData: response,
			trackSettings: getTracks()
		})

		isSuccess = true
	} catch (e) {
		console.log(e)
	}
	return isSuccess
}

function getFileNameFromUrl(url) {
	let fileName = url
	fileName = fileName.split("?raw=true")[0]
	let slashed = fileName.split("/")
	fileName = slashed[slashed.length - 1]
	return fileName
}
