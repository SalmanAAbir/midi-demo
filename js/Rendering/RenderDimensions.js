import { getWhiteKeyNumber, isBlack } from "../Util.js"
import {
	addDynamicSettingsToObj,
	getSetting,
	setSettingCallback,
	triggerSettingCallback
} from "../settings/Settings.js"
import { PROGRESS_BAR_CANVAS_HEIGHT } from "./Render.js"

const MAX_NOTE_NUMBER = 87
const MIN_NOTE_NUMBER = 0

const MIN_WIDTH = 0
const MIN_HEIGHT = 560

/**
 * Class to handle all the calculation of dimensions of the Notes & Keys on Screen-
 */
export class RenderDimensions {
	constructor() {
		window.addEventListener("resize", this.resize.bind(this))
		this.resizeCallbacks = []
		this.numberOfWhiteKeysShown = 52
		this.minNoteNumber = MIN_NOTE_NUMBER
		this.maxNoteNumber = MAX_NOTE_NUMBER
		this.menuHeight = 200
		this.sheetY = 0
		this.sheetHeight = getSetting("enableSheet") ? 340 : 0
		setSettingCallback("blackKeyHeight", this.resize.bind(this))
		setSettingCallback("whiteKeyHeight", this.resize.bind(this))
		setSettingCallback("reverseNoteDirection", this.resize.bind(this))
		setSettingCallback("pianoPosition", this.resize.bind(this))

		addDynamicSettingsToObj(
			[
				"pianoPosition",
				"blackKeyHeight",
				"whiteKeyHeight",
				"reverseNoteDirection",
				"playedNoteFalloffSpeed",
				"minNoteHeight",
				"noteBorderRadius",
				"showSustainedNotes",
				"noteEndedShrink",
				"noteToHeightConst",
				"playedNoteFalloffSpeed"
			],
			this,
			"_"
		)
		this.resize()
	}
	/**
	 * Recompute all dimensions dependent on Screen Size
	 */
	resize() {
		//update because these settings can cause a resize before the _value is updated
		this._pianoPosition = getSetting("pianoPosition")
		this._blackKeyHeight = getSetting("blackKeyHeight")
		this._whiteKeyHeight = getSetting("whiteKeyHeight")
		this._reverseNoteDirection = getSetting("reverseNoteDirection")

		this.windowWidth = Math.max(MIN_WIDTH, Math.floor(window.innerWidth))
		this.windowHeight = Math.floor(window.innerHeight)
		this.renderWidth = this.windowWidth /** window.devicePixelRatio*/
		this.renderHeight = this.windowHeight /** window.devicePixelRatio*/

		let navBar = document.querySelector(".navbar")
		if (navBar) {
			this.menuHeight = navBar.clientHeight + parseFloat(navBar.style.marginTop)
			this.sheetY =
				this.menuHeight +
				PROGRESS_BAR_CANVAS_HEIGHT /* * window.devicePixelRatio*/
		}

		this.keyDimensions = {}
		this.computeKeyDimensions()
		this.computeAbsolutePianoPosition()
		triggerSettingCallback("pianoResized")
		this.resizeCallbacks.forEach(func => func())
	}
	registerResizeCallback(callback) {
		this.resizeCallbacks.push(callback)
	}

	/**
	 * Computes the key dimensions. Should be called on resize.
	 */
	computeKeyDimensions() {
		this.whiteKeyWidth = this.renderWidth / this.numberOfWhiteKeysShown
		this._keyResolution = this.whiteKeyWidth / 100

		this.whiteKeyHeight = Math.min(
			Math.floor(this.renderHeight * 0.2),
			this.whiteKeyWidth * 6.5
		)
		this.blackKeyWidth = Math.floor(this.whiteKeyWidth * 0.5829787234)
		this.blackKeyHeight =
			Math.floor(this.whiteKeyHeight * 0.6643356) * (this._blackKeyHeight / 100)

		//Do this after computing blackKey, as its dependent on the white key size ( without adjusting for the setting )
		this.whiteKeyHeight *= this._whiteKeyHeight / 100
	}

	setSheetHeight(height) {
		this.sheetHeight = height
		this.resize()
		// this.computeAbsolutePianoPosition()
	}
	/**
	 * Returns the dimensions for the piano-key of the given note
	 *
	 * @param {Number} noteNumber
	 */
	getKeyDimensions(noteNumber) {
		if (!this.keyDimensions.hasOwnProperty(noteNumber)) {
			let isNoteBlack = isBlack(noteNumber)
			let x = this.getKeyX(noteNumber)

			this.keyDimensions[noteNumber] = {
				x: x,
				y: 0,
				w: isNoteBlack ? this.blackKeyWidth : this.whiteKeyWidth,
				h: isNoteBlack ? this.blackKeyHeight : this.whiteKeyHeight,
				black: isNoteBlack
			}
		}
		return this.keyDimensions[noteNumber]
	}
	computeAbsolutePianoPosition() {
		let pianoSettingsRatio = this._reverseNoteDirection
			? 1 - this._pianoPosition / 100
			: this._pianoPosition / 100

		this.absolutePianoPosition =
			this.renderHeight -
			this.whiteKeyHeight -
			Math.ceil(
				pianoSettingsRatio *
					(this.renderHeight -
						this.whiteKeyHeight -
						this.sheetHeight -
						this.menuHeight -
						24)
			)
	}
	getAbsolutePianoPosition(scaled = false) {
		return (
			this.absolutePianoPosition *
			(scaled ? 1 : 1) /*/ window.devicePixelRatio*/
		)
	}

	/**
	 * Returns x-value  of the given Notenumber
	 *
	 * @param {Integer} noteNumber
	 */
	getKeyX(noteNumber) {
		return (
			(getWhiteKeyNumber(noteNumber) - getWhiteKeyNumber(this.minNoteNumber)) *
				this.whiteKeyWidth +
			(this.whiteKeyWidth - this.blackKeyWidth / 2) * isBlack(noteNumber)
		)
	}

	/**
	 * Returns y value corresponding to the given time
	 *
	 * @param {Number} time
	 */
	getYForTime(time) {
		const height = this.renderHeight - this.whiteKeyHeight
		let noteToHeightConst = this.getNoteToHeightConst()
		if (time < 0) {
			noteToHeightConst /= this._playedNoteFalloffSpeed
		}

		if (this._reverseNoteDirection) {
			return (
				(time / noteToHeightConst) * height +
				this.getAbsolutePianoPosition(true) +
				this.whiteKeyHeight
			)
		} else {
			return (
				-(time / noteToHeightConst) * height +
				this.getAbsolutePianoPosition(true)
			)
		}
	}

	/**
     *Returns rendering x/y-location & size for the given note & time-info
     
	 * @param {Integer} time 
	 * @param {Note} note
	 */
	getNoteDimensions(time, note) {
		const { noteNumber, timestamp, offTime, sustainOffTime } = note
		const dur = offTime - timestamp
		const isKeyBlack = isBlack(noteNumber)
		let x = this.getKeyX(noteNumber)
		let w = isKeyBlack ? this.blackKeyWidth : this.whiteKeyWidth
		let h =
			(dur / this.getNoteToHeightConst()) *
			(this.renderHeight - this.whiteKeyHeight)

		//Correct h if note too short
		let hCorrection = 0
		let minNoteHeight = parseFloat(this._minNoteHeight)
		if (h < minNoteHeight + 2) {
			hCorrection = minNoteHeight + 2 - h
			h = minNoteHeight + 2
		}

		//correct rad if h too low
		let rad = (this._noteBorderRadius / 100) * w
		if (h < rad * 2) {
			rad = h / 2
		}
		let y = this.getYForTime(offTime - time)
		let reversed = this._reverseNoteDirection
		if (reversed) {
			y -= h
		}

		let sustainY = 0
		let sustainH = 0
		if (sustainOffTime > offTime) {
			sustainH =
				((sustainOffTime - offTime) / this.getNoteToHeightConst()) *
				(this.renderHeight - this.whiteKeyHeight)
			sustainY = this.getYForTime(sustainOffTime - time)
			if (reversed) {
				sustainY -= sustainH
			}
		}

		//adjust height/y for notes that have passed the piano / have been played
		let showSustainedNotes = this._showSustainedNotes
		let endTime = showSustainedNotes
			? Math.max(isNaN(sustainOffTime) ? 0 : sustainOffTime, offTime)
			: offTime

		if (showSustainedNotes) {
			if (!isNaN(sustainOffTime) && sustainOffTime < time) {
				sustainY += (reversed ? -1 : 1) * this.whiteKeyHeight
			}
			if (!isNaN(sustainOffTime) && sustainOffTime > time && offTime < time) {
				sustainH += this.whiteKeyHeight
				if (reversed) {
					sustainY -= this.whiteKeyHeight
				}
			}
		}

		if (endTime < time) {
			let endRatio = (time - endTime) / this.getMilisecondsDisplayedAfter()

			endRatio = Math.max(0, 1 - this._noteEndedShrink * endRatio)

			x = x + (w - w * endRatio) / 2
			w *= endRatio

			let tmpH = h
			h *= endRatio
			y += (reversed ? -1 : 1) * (tmpH - h)

			let tmpSustainH = sustainH
			sustainH *= endRatio
			sustainY +=
				(reversed ? -1 : 1) * (tmpSustainH - sustainH) +
				(reversed ? -1 : 1) * (tmpH - h)
		}

		if (w < 5) {
			let diff = 5 - w
			w = 5
			x -= diff / 2
		}
		return {
			x: x + 1,
			y: y + 1 + (reversed ? hCorrection : -hCorrection),
			w: w - 2,
			h: h - 2,
			rad: rad,
			sustainH: sustainH,
			sustainY: sustainY,
			isBlack: isKeyBlack
		}
	}

	getNoteToHeightConst() {
		return this._noteToHeightConst * this.renderHeight
	}

	getSecondsDisplayedBefore() {
		let pianoPos = this._pianoPosition / 100
		return Math.ceil(((1 - pianoPos) * this.getNoteToHeightConst()) / 1000)
	}
	getSecondsDisplayedAfter() {
		return Math.ceil(this.getMilisecondsDisplayedAfter() / 1000)
	}
	getMilisecondsDisplayedAfter() {
		let pianoPos = this._pianoPosition / 100
		return (
			pianoPos * (this.getNoteToHeightConst() / this._playedNoteFalloffSpeed)
		)
	}

	//ZOOM
	showAll() {
		this.setZoom(MIN_NOTE_NUMBER, MAX_NOTE_NUMBER)
	}
	fitSong(range) {
		range.min = Math.max(range.min, MIN_NOTE_NUMBER)
		range.max = Math.min(range.max, MAX_NOTE_NUMBER)
		while (
			isBlack(range.min - MIN_NOTE_NUMBER) &&
			range.min > MIN_NOTE_NUMBER
		) {
			range.min--
		}
		while (
			isBlack(range.max - MIN_NOTE_NUMBER) &&
			range.max < MAX_NOTE_NUMBER
		) {
			range.max++
		}
		this.setZoom(range.min, range.max)
	}
	zoomIn() {
		this.minNoteNumber++
		this.maxNoteNumber--
		while (
			isBlack(this.minNoteNumber - MIN_NOTE_NUMBER) &&
			this.minNoteNumber < this.maxNoteNumber
		) {
			this.minNoteNumber++
		}
		while (
			isBlack(this.maxNoteNumber - MIN_NOTE_NUMBER) &&
			this.maxNoteNumber > this.minNoteNumber
		) {
			this.maxNoteNumber--
		}
		this.setZoom(this.minNoteNumber, this.maxNoteNumber)
	}
	zoomOut() {
		this.minNoteNumber--
		this.maxNoteNumber++
		while (
			isBlack(this.minNoteNumber - MIN_NOTE_NUMBER) &&
			this.minNoteNumber > MIN_NOTE_NUMBER
		) {
			this.minNoteNumber--
		}
		while (
			isBlack(this.maxNoteNumber - MIN_NOTE_NUMBER) &&
			this.maxNoteNumber < MAX_NOTE_NUMBER
		) {
			this.maxNoteNumber++
		}
		this.setZoom(
			Math.max(MIN_NOTE_NUMBER, this.minNoteNumber),
			Math.min(MAX_NOTE_NUMBER, this.maxNoteNumber)
		)
	}
	moveViewLeft() {
		if (this.minNoteNumber == MIN_NOTE_NUMBER) return
		this.minNoteNumber--
		this.maxNoteNumber--
		while (
			isBlack(this.minNoteNumber - MIN_NOTE_NUMBER) &&
			this.minNoteNumber > MIN_NOTE_NUMBER
		) {
			this.minNoteNumber--
		}
		while (isBlack(this.maxNoteNumber - MIN_NOTE_NUMBER)) {
			this.maxNoteNumber--
		}
		this.setZoom(
			Math.max(MIN_NOTE_NUMBER, this.minNoteNumber),
			this.maxNoteNumber
		)
	}
	moveViewRight() {
		if (this.maxNoteNumber == MAX_NOTE_NUMBER) return
		this.minNoteNumber++
		this.maxNoteNumber++
		while (isBlack(this.minNoteNumber - MIN_NOTE_NUMBER)) {
			this.minNoteNumber++
		}
		while (
			isBlack(this.maxNoteNumber - MIN_NOTE_NUMBER) &&
			this.maxNoteNumber < MAX_NOTE_NUMBER
		) {
			this.maxNoteNumber++
		}

		this.setZoom(
			this.minNoteNumber,
			Math.min(MAX_NOTE_NUMBER, this.maxNoteNumber)
		)
	}

	/**
	 *
	 * @param {Number} minNoteNumber
	 * @param {Number} maxNoteNumber
	 */
	setZoom(minNoteNumber, maxNoteNumber) {
		let numOfWhiteKeysInRange = 0
		for (let i = minNoteNumber; i <= maxNoteNumber; i++) {
			numOfWhiteKeysInRange += isBlack(i - MIN_NOTE_NUMBER) ? 0 : 1
		}
		this.minNoteNumber = minNoteNumber
		this.maxNoteNumber = maxNoteNumber
		this.numberOfWhiteKeysShown = numOfWhiteKeysInRange

		this.resize()
	}
}

var theRenderDimensions
export const getRenderDimensions = () => {
	if (!theRenderDimensions) {
		theRenderDimensions = new RenderDimensions()
	}
	return theRenderDimensions
}
