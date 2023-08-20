import { getCurrentSong, getPlayer } from "./player/Player.js"
import {
	getSetting,
	setSettingCallback,
	setSettingUI
} from "./settings/Settings.js"

class LoopManager {
	constructor(opts) {
		this.loop = null

		this.enabled = getSetting("enableLoop")

		getPlayer().addNewSongCallback(() => {
			this.setup()
		})
		setSettingCallback("enableLoop", () => {
			this.enabled = getSetting("enableLoop")
			getPlayer().loopDelay = 0
			getPlayer().isLoopReset = false
		})
	}
	setup() {
		let curSong = getCurrentSong()
		if (!curSong) {
			console.error("Cannot add Loop - No current song")
			return
		}

		let measureLinesObj = curSong.getMeasureLines()
		let keys = Object.keys(measureLinesObj)
		keys.sort((a, b) => a - b)
		this.measureLines = keys.flatMap(key => measureLinesObj[key])

		this.measureLineAmount = this.measureLines.length

		let { measureLineAmount } = this

		this.startMeasure = parseInt(getSetting("loopStart"))
		this.endMeasure = parseInt(getSetting("loopEnd"))
		this.delay = parseInt(getSetting("loopDelay"))

		if (this.startMeasure >= measureLineAmount - 1) {
			this.startMeasure = measureLineAmount - 2
			setSettingUI("loopStart", this.startMeasure)
		}
		if (this.endMeasure >= measureLineAmount) {
			this.endMeasure = measureLineAmount - 1
			setSettingUI("loopEnd", this.endMeasure)
		}
		if (this.endMeasure <= this.startMeasure) {
			if (this.endMeasure > 0) {
				this.startMeasure = 0
			} else {
				this.endMeasure = this.startMeasure + 1
			}
			setSettingUI("loopStart", this.startMeasure)
			setSettingUI("loopEnd", this.endMeasure)
		}

		let startSlider = document.querySelector("#loopStart")
		let endSlider = document.querySelector("#loopEnd")
		let startSliderVal = document.querySelector("#loopStartField")
		let endSliderVal = document.querySelector("#loopEndField")

		startSlider.max = measureLineAmount - 2
		endSlider.max = measureLineAmount - 1
		endSlider.value = this.endMeasure
		startSlider.value = this.startMeasure

		this.createLoop()

		if (this.enabled && !getPlayer().playing && getPlayer().getTime() >= 0) {
			getPlayer().setScrollAim(getCurrentLoop().start)
		}

		setSettingCallback(
			"loopStart",
			function (ev) {
				let val = parseInt(getSetting("loopStart"))
				if (val < measureLineAmount - 1) {
					this.startMeasure = val
					if (this.startMeasure >= this.endMeasure) {
						this.endMeasure = this.startMeasure + 1
						setSettingUI("loopEnd", this.endMeasure)
					}
				}
				this.createLoop()
			}.bind(this)
		)
		setSettingCallback(
			"loopEnd",
			function () {
				let val = parseInt(getSetting("loopEnd"))
				if (val < measureLineAmount - 1) {
					this.endMeasure = val
					if (this.endMeasure <= this.startMeasure) {
						this.startMeasure = this.endMeasure - 1
						setSettingUI("loopStart", this.startMeasure)
					}
				}
				this.createLoop()
			}.bind(this)
		)
	}

	createLoop() {
		let { start, end } = this.computeTimes()

		this.loop = new Loop({
			start,
			end,
			delay: parseInt(getSetting("loopDelay"))
		})
	}
	computeTimes() {
		const { startMeasure, endMeasure } = this
		let { measureLines } = this

		let start = measureLines[startMeasure][0] / 1000
		let end = measureLines[endMeasure][0] / 1000
		return { start, end }
	}
	getCurrent() {
		return this.loop
	}

	moveForward() {
		let { measureLineAmount } = this

		if (this.startMeasure < measureLineAmount - 2) {
			this.startMeasure++
			setSettingUI("loopStart", this.startMeasure)
		}
		if (this.endMeasure < measureLineAmount - 1) {
			this.endMeasure++
			setSettingUI("loopEnd", this.endMeasure)
		}
		this.createLoop()
	}
	moveBackward() {
		if (this.startMeasure > 0) {
			this.startMeasure--
			setSettingUI("loopStart", this.startMeasure)
		}
		if (this.endMeasure > 1) {
			this.endMeasure--
			setSettingUI("loopEnd", this.endMeasure)
		}
		this.createLoop()
	}
	expandLeft() {
		if (this.startMeasure > 0) {
			this.startMeasure--
			setSettingUI("loopStart", this.startMeasure)
		}
		this.createLoop()
	}
	expandRight() {
		let { measureLineAmount } = this
		if (this.endMeasure < measureLineAmount - 1) {
			this.endMeasure++
			setSettingUI("loopEnd", this.endMeasure)
		}
		this.createLoop()
	}
	shrinkLeft() {
		if (this.endMeasure - this.startMeasure > 1) {
			this.startMeasure++
			setSettingUI("loopStart", this.startMeasure)
		}
		this.createLoop()
	}
	shrinkRight() {
		if (this.endMeasure - this.startMeasure > 1) {
			this.endMeasure--
			setSettingUI("loopEnd", this.endMeasure)
		}
		this.createLoop()
	}
}
class Loop {
	constructor(opts) {
		this._start = opts.start
		this._end = opts.end
		this._delay = opts.delay
	}
	get start() {
		return this._start
	}
	get end() {
		return this._end
	}
	get delay() {
		return this._delay
	}
	get duration() {
		if (!this.hasOwnProperty("_duration")) {
			this._duration = this.end - this.start
		}
		return this._duration
	}
}

export const getCurrentLoop = () => {
	return getLoopManager().getCurrent()
}

var theLoopManager
export const getLoopManager = () => {
	if (!theLoopManager) {
		theLoopManager = new LoopManager()
	}
	return theLoopManager
}
