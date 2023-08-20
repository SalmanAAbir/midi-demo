import { DomHelper } from "./DomHelper.js"
import {
	getTrack,
	getTrackColor,
	getTracks,
	setTrackColor,
	setupTracks
} from "../player/Tracks.js"
import { getCurrentSong, getPlayer } from "../player/Player.js"
import { SettingUI } from "./SettingUI.js"
import { CONST } from "../data/CONST.js"
import { getLoader } from "./Loader.js"
import { saveCurrentTrackSettings } from "../settings/IndexDbHandler.js"
import { getSongSettings } from "../settings/SongSettings.js"
import { getUI } from "./UI.js"

/**
 *  Handles creation of the Track-Divs that give control over volume, diplay, color...
 *
 *  Directly changes values in the track objects
 */

export const createTrackDivs = () => {
	return Object.keys(getTracks())
		.sort((a, b) => a - b)
		.map(trackId => createTrackDiv(trackId))
		.concat([getResetAllButton()])
}

export const createTrackDiv = trackId => {
	const trackObj = getTrack(trackId)
	let volumeSlider,
		muteButton,
		hideButton,
		trackName,
		instrumentName,
		requireToPlayAlongButton,
		clickableTitleDiv

	let trackDiv = DomHelper.createDivWithIdAndClass(
		"trackDiv" + trackId,
		"innerMenuContDiv settingGroupContainer collapsable",
		{
			borderLeft: "5px solid " + getTrackColor(trackId).white
		}
	)

	clickableTitleDiv = DomHelper.createDivWithClass("clickableTitle")
	let collapsed = instrumentName == "percussion" ? true : false

	let glyph = DomHelper.getGlyphicon("menu-right")
	glyph.classList.add("rightGlyphSpan")
	clickableTitleDiv.appendChild(glyph)

	clickableTitleDiv.onclick = () => {
		if (collapsed) {
			collapsed = false
			trackDiv.classList.remove("collapsed")
			trackDiv.style.maxHeight = trackDiv.scrollHeight + "px"
			// DomHelper.replaceGlyph(clickableTitleDiv, "menu-right", "minus")
		} else {
			collapsed = true
			trackDiv.classList.add("collapsed")
			trackDiv.style.maxHeight = "3rem"
			// DomHelper.replaceGlyph(clickableTitleDiv, "minus", "plus")
		}
	}

	//Name
	trackName = DomHelper.createDivWithIdAndClass(
		"trackName" + trackId,
		"trackName"
	)
	trackName.innerHTML = trackObj.name || "Track " + trackId

	//Instrument
	let currentInstrument = trackObj.overwrittenInstrument
		? trackObj.overwrittenInstrument
		: getPlayer().getCurrentTrackInstrument(trackObj.index)
	instrumentName = DomHelper.createDivWithIdAndClass(
		"instrumentName" + trackObj.index,
		"instrumentName"
	)
	instrumentName.innerHTML = currentInstrument

	let btnGrp = DomHelper.createButtonGroup(false)

	let instrumentSetting = {
		id: "instrument" + trackId,
		type: "list",
		label: "Instrument ",
		value: currentInstrument,
		list: Object.keys(CONST.INSTRUMENTS.BY_ID)
			.map(id => CONST.INSTRUMENTS.BY_ID[id].id)
			.sort(),
		onChange: async value => {
			getLoader().startLoad()
			trackObj.overwrittenInstrument = value
			saveCurrentTrackSettings()
			let player = getPlayer()
			let wasPaused = player.paused
			player.pause()
			await player.checkAllInstrumentsLoaded().then(val => {
				getLoader().stopLoad()
				if (!wasPaused) {
					player.resume()
				}
			})
		}
	}
	let instrumentChooser = SettingUI.createSettingDiv(instrumentSetting)

	//Track Volume
	let trackVolumeSetting = {
		id: "volume" + trackId,
		type: "slider",
		label: "Volume ",
		value: trackObj.volume,
		min: 0,
		max: 200,
		step: 1,
		onChange: value => {
			if (trackObj.volume == 0 && value != 0) {
				muteButton.querySelector("input").checked = false
			} else if (trackObj.volume != 0 && value == 0) {
				muteButton.querySelector("input").checked = true
			}
			trackObj.volume = parseInt(value)
			saveCurrentTrackSettings()
		}
	}
	volumeSlider = SettingUI.createSettingDiv(trackVolumeSetting)

	//Hide Track
	let hideSetting = {
		id: "show" + trackId,
		type: "checkbox",
		label: "Show track",
		value: trackObj.draw,
		onChange: () => {
			if (trackObj.draw) {
				trackObj.draw = false
			} else {
				trackObj.draw = true
			}
			saveCurrentTrackSettings()
		}
	}
	hideButton = SettingUI.createSettingDiv(hideSetting)

	//Mute Track
	let muteTrackSetting = {
		id: "mute" + trackId,
		type: "checkbox",
		label: "Mute track",
		value: trackObj.volume == 0,
		onChange: () => {
			let volumeSliderInput = volumeSlider.querySelector("input")
			let volumeSliderLabel = volumeSlider.querySelector(".sliderVal")
			if (trackObj.volume == 0) {
				let volume = trackObj.volumeAtMute || 100
				trackObj.volume = volume
				volumeSliderInput.value = volume
				trackObj.volumeAtMute = 0
				volumeSliderLabel.innerHTML = volume
			} else {
				trackObj.volumeAtMute = trackObj.volume
				trackObj.volume = 0
				volumeSliderInput.value = 0
				volumeSliderLabel.innerHTML = 0
			}
			saveCurrentTrackSettings()
		}
	}
	muteButton = SettingUI.createSettingDiv(muteTrackSetting)

	//Require Track to play along
	let requiredToPlaySetting = {
		id: "playalong" + trackId,
		type: "checkbox",
		label: "Require playalong",
		value: trackObj.requiredToPlay,
		isChecked: () => trackObj.requiredToPlay,
		onChange: () => {
			if (!trackObj.requiredToPlay) {
				// if (!getMidiHandler().isInputActive()) {
				// 	Notification.create(
				// 		"You have to choose a Midi Input Device to play along.",
				// 		5000
				// 	)
				// 	new ElementHighlight(document.querySelector("#midiSetup"))

				// 	return
				// }
				trackObj.requiredToPlay = true
			} else {
				trackObj.requiredToPlay = false
			}
			saveCurrentTrackSettings()
		}
	}
	requireToPlayAlongButton = SettingUI.createSettingDiv(requiredToPlaySetting)

	let sheetEnabledSetting = {
		id: "sheet" + trackId,
		type: "checkbox",
		label: "Draw Sheet Music",
		value: trackObj.sheetEnabled,
		isChecked: () => trackObj.sheetEnabled,
		onChange: () => {
			if (!trackObj.sheetEnabled) {
				trackObj.sheetEnabled = true
			} else {
				trackObj.sheetEnabled = false
			}
			saveCurrentTrackSettings()
		}
	}
	let sheetEnabledButton = SettingUI.createSettingDiv(sheetEnabledSetting)

	let colorWhiteSetting = {
		id: "colorW" + trackId,
		type: "color",
		label: "White note color",
		value: getTrackColor(trackId).white,
		onChange: colorString => {
			trackDiv.style.borderLeft = "5px solid " + colorString
			setTrackColor(trackId, "white", colorString)
			saveCurrentTrackSettings()
		}
	}
	let colorPickerWhite = SettingUI.createColorSettingDiv(colorWhiteSetting)
	let colorBlackSetting = {
		id: "colorB" + trackId,
		type: "color",
		label: "Black note color",
		value: getTrackColor(trackId).black,
		onChange: colorString => {
			setTrackColor(trackId, "black", colorString)
			saveCurrentTrackSettings()
		}
	}
	let colorPickerBlack = SettingUI.createColorSettingDiv(colorBlackSetting)

	DomHelper.appendChildren(btnGrp, [
		instrumentChooser,
		hideButton,
		muteButton,
		DomHelper.getDivider(),
		requireToPlayAlongButton,
		sheetEnabledButton,
		DomHelper.getDivider(),
		colorPickerWhite,
		colorPickerBlack
	])

	DomHelper.appendChildren(clickableTitleDiv, [trackName, instrumentName])
	DomHelper.appendChildren(trackDiv, [
		clickableTitleDiv,
		DomHelper.getDivider(),
		volumeSlider,
		btnGrp
	])

	window.setTimeout(() => {
		if (collapsed) {
			trackDiv.classList.add("collapsed")
			trackDiv.style.maxHeight = "3rem"
		} else {
			trackDiv.style.maxHeight = trackDiv.scrollHeight + "px"
		}
	}, 500)

	return trackDiv
}
function getResetAllButton() {
	return DomHelper.createSettingsButtonGroup([
		DomHelper.createTextButton(
			"resetTrackSettings",
			"Reset track settings",
			() => {
				let currentSong = getCurrentSong()
				if (currentSong) {
					let fileName = currentSong.fileName
					getSongSettings().deleteSongSettings(fileName)
					setupTracks()
					saveCurrentTrackSettings()
					getUI().resetTrackMenuDiv()
				}
			}
		)
	])
}
