import { getSetting, setSettingCallback } from "../../settings/Settings.js"
import { getRenderDimensions } from "../RenderDimensions.js"
import { BlackKey } from "./BlackKey.js"
import { WhiteKey } from "./WhiteKey.js"

class KeySpriteManager {
	constructor(opts) {
		this.keys = {
			white: {},
			black: {}
		}

		this.setBaseColors()
		setSettingCallback("pianoBlackKeyColor", this.setBaseColors.bind(this))
		setSettingCallback("pianoWhiteKeyColor", this.setBaseColors.bind(this))
		getRenderDimensions().registerResizeCallback(this.resize.bind(this))
	}
	setBaseColors() {
		this.baseBlack = getSetting("pianoBlackKeyColor")
		this.baseWhite = getSetting("pianoWhiteKeyColor")
	}
	getWhite(color) {
		if (!this.keys.white[color]) {
			this.keys.white[color] = this.generateWhite(color)
		}
		return this.keys.white[color]
	}
	getBlack(color) {
		if (!this.keys.black[color]) {
			this.keys.black[color] = this.generateBlack(color)
		}
		return this.keys.black[color]
	}
	generateWhite(color) {
		let renderDims = getRenderDimensions()
		return new WhiteKey({
			w: renderDims.whiteKeyWidth,
			h: renderDims.whiteKeyHeight,
			color,
			isActive: color != this.baseWhite
		})
	}
	generateBlack(color) {
		let renderDims = getRenderDimensions()
		return new BlackKey({
			w: renderDims.blackKeyWidth,
			h: renderDims.blackKeyHeight,
			color,
			isActive: color != this.baseBlack
		})
	}
	resize() {
		let renderDims = getRenderDimensions()
		for (let key in this.keys.white) {
			this.keys.white[key].resize(
				renderDims.whiteKeyWidth - 2 * renderDims._keyResolution,
				renderDims.whiteKeyHeight - 2 * renderDims._keyResolution
			)
		}
		for (let key in this.keys.black) {
			this.keys.black[key].resize(
				renderDims.blackKeyWidth,
				renderDims.blackKeyHeight
			)
		}
	}
}

var theKeySpriteManager
export const getKeySpriteManager = () => {
	if (!theKeySpriteManager) {
		theKeySpriteManager = new KeySpriteManager()
	}
	return theKeySpriteManager
}
