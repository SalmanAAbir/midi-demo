import { CONST } from "../data/CONST.js"
import { getSongSettings as getSavedTrackSettings } from "../settings/SongSettings.js"
import { getCurrentSong } from "./Player.js"

var theTracks = {}
export const getTracks = () => {
	return theTracks
}
export const getTrack = trackId => {
	return theTracks[trackId]
}
export const setupTracks = async () => {
	let currentSong = getCurrentSong()
	let { fileName, activeTracks } = currentSong

	let prevSettings = getSavedTrackSettings().getSettings(fileName)

	theTracks = {}
	let counter = 0 // only show the first two tracks as sheet by default
	if (
		prevSettings &&
		Object.keys(prevSettings).length == Object.keys(activeTracks).length
	) {
		theTracks = prevSettings
	} else {
		for (let trackId in activeTracks) {
			if (!theTracks.hasOwnProperty(trackId)) {
				theTracks[trackId] = {
					draw: true,
					color: {
						white: CONST.TRACK_COLORS[trackId % 4].white,
						black: CONST.TRACK_COLORS[trackId % 4].black
					},
					volume: 100,
					name: activeTracks[trackId].name || "Track " + trackId,
					requiredToPlay: false,
					index: trackId,
					sheetEnabled: ++counter < 3
				}
			}
		}
		getSavedTrackSettings().add(fileName, theTracks)
	}
}

export const isTrackRequiredToPlay = trackId => {
	return theTracks[trackId].requiredToPlay
}

export const isAnyTrackPlayalong = () => {
	return (
		Object.keys(theTracks).filter(trackId => theTracks[trackId].requiredToPlay)
			.length > 0
	)
}

export const getTrackVolume = trackId => {
	return theTracks[trackId].volume
}

export const isTrackDrawn = trackId => {
	return theTracks[trackId] && theTracks[trackId].draw
}

export const getTrackColor = trackId => {
	return theTracks[trackId] ? theTracks[trackId].color : "rgba(0,0,0,0)"
}

export const setTrackColor = (trackId, colorId, color) => {
	theTracks[trackId].color[colorId] = color
}

export const isTrackSheetEnabled = trackId => {
	return theTracks[trackId].sheetEnabled
}
