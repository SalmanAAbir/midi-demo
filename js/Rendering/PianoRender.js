import { DomHelper } from "../ui/DomHelper.js"
import { getSetting, setSettingCallback } from "../settings/Settings.js"
import { formatNote, isBlack } from "../Util.js"
import { getRenderDimensions } from "./RenderDimensions.js"
import { getKeySpriteManager } from "./piano/KeySpriteManager.js"
/**
 * Class to render the piano (and the colored keys played on the piano)
 */
export class PianoRender {
	constructor() {
		getRenderDimensions().registerResizeCallback(this.resize.bind(this))
		this.clickCallback = null
		this.blackKeyImg = new Image()
		this.blackKeyImg.src = "../../blackKey.svg"
		this.blackKeyImg.onload
		this.positionY = 50 //from bottom

		setSettingCallback("pianoWhiteKeyColor", this.resize.bind(this))
		setSettingCallback("pianoBlackKeyColor", this.resize.bind(this))
		setSettingCallback("pianoBackgroundColor", this.resize.bind(this))

		this.keyManager = getKeySpriteManager()
		this.resize()
	}
	/**
	 * Resize canvases and redraw piano.
	 */
	resize() {
		this.resizeCanvases()
		this.drawPiano(this.ctxWhite, this.ctxBlack)
	}
	/**
	 * pass listeners that are called with the note number as argument when piano canvas is clicked.
	 * @param {Function} onNoteOn
	 * @param {Function} onNoteOff
	 */
	setPianoInputListeners(onNoteOn, onNoteOff) {
		this.onNoteOn = onNoteOn
		this.onNoteOff = onNoteOff
	}
	/**
	 * Register a callback to trigger when user clicks the piano Canvas. Callback is called with
	 */
	setClickCallback(callback) {
		this.clickCallback = callback
	}
	getAllCanvases() {
		return [
			this.getPianoCanvasWhite(),
			this.getPlayedKeysWhite(),
			this.getPianoCanvasBlack(),
			this.getPlayedKeysBlack()
		]
	}

	/**
	 * Resizes all piano canvases.
	 */
	resizeCanvases() {
		getKeySpriteManager().resize()
		const renderDims = getRenderDimensions()
		const wKeyHt = renderDims.whiteKeyHeight
		const bKeyHt = renderDims.blackKeyHeight
		const windowWd = renderDims.renderWidth
		this.getAllCanvases().forEach(canvas => {
			DomHelper.setCanvasSize(canvas, windowWd, Math.max(wKeyHt, bKeyHt))
			canvas.style.width = renderDims.windowWidth + "px"
			canvas.style.height =
				Math.max(wKeyHt, bKeyHt) /* / window.devicePixelRatio */ + "px"
		})
		this.repositionCanvases()
	}

	repositionCanvases() {
		const pianoPos = getRenderDimensions().getAbsolutePianoPosition()
		this.getAllCanvases().forEach(canvas => {
			canvas.style.top = pianoPos + "px"
		})
	}

	drawActiveKey(renderInfo, color) {
		let dim = getRenderDimensions().getKeyDimensions(renderInfo.noteNumber)
		let isKeyBlack = renderInfo.isBlack
		let ctx = isKeyBlack ? this.playedKeysCtxBlack : this.playedKeysCtxWhite

		let velocityStartFrames = 1
		let startTimeRatio = 1
		if (getSetting("drawPianoKeyHitEffect")) {
			velocityStartFrames = (327 - renderInfo.velocity) / 1 // ~65 -> 40
			startTimeRatio = Math.min(
				1,
				0.6 +
					(renderInfo.currentTime - renderInfo.timestamp) / velocityStartFrames
			)
		}

		ctx.save()
		ctx.globalCompositeOperation = getSetting("pianoEnableLighter")
			? "lighter"
			: "source-over"
		ctx.shadowColor = getSetting("pianoShadowColor")
		ctx.shadowBlur = getSetting("pianoShadowBlur")
		ctx.fillStyle = color
		if (isKeyBlack) {
			this.drawBlackKey(ctx, dim, color, startTimeRatio)
		} else {
			this.drawWhiteKey(ctx, dim, color, startTimeRatio)
		}
		ctx.globalCompositeOperation = "source-over"
		ctx.restore()
	}

	clearPlayedKeysCanvases() {
		const renderDims = getRenderDimensions()
		const wKeyHt = renderDims.whiteKeyHeight
		const bKeyHt = renderDims.blackKeyHeight
		const windowWd = renderDims.renderWidth
		this.playedKeysCtxWhite.clearRect(
			0,
			0,
			windowWd,
			Math.max(wKeyHt, bKeyHt) + 100
		)
		this.playedKeysCtxBlack.clearRect(
			0,
			0,
			windowWd,
			Math.max(wKeyHt, bKeyHt) + 100
		)
	}

	drawPiano(ctxWhite, ctxBlack) {
		const renderDims = getRenderDimensions()
		const wKeyHt = renderDims.whiteKeyHeight
		const bKeyHt = renderDims.blackKeyHeight
		const windowWd = renderDims.renderWidth
		ctxWhite.clearRect(0, 0, windowWd, Math.max(wKeyHt, bKeyHt) + 100)
		ctxBlack.clearRect(0, 0, windowWd, Math.max(wKeyHt, bKeyHt) + 100)
		// Background
		ctxWhite.fillStyle = getSetting("pianoBackgroundColor")
		ctxWhite.fillRect(0, 0, windowWd, wKeyHt + 100)

		this.drawWhiteKeys(ctxWhite)
		if (getSetting("showKeyNamesOnPianoWhite")) {
			this.drawWhiteKeyNames(ctxWhite)
		}

		this.drawBlackKeys(ctxBlack)
		if (getSetting("showKeyNamesOnPianoBlack")) {
			this.drawBlackKeyNames(ctxBlack)
		}

		//velvet
		ctxWhite.strokeStyle = "rgba(155,50,50,1)"
		ctxWhite.shadowColor = "rgba(255,255,255,1)"
		ctxWhite.shadowOffsetY = 1
		ctxWhite.shadowBlur = 5
		ctxWhite.filter = "blur(0px)"
		ctxWhite.lineWidth = 18 * getRenderDimensions()._keyResolution
		ctxWhite.beginPath()
		ctxWhite.moveTo(getRenderDimensions().windowWidth, ctxWhite.lineWidth / 2)
		ctxWhite.lineTo(0, ctxWhite.lineWidth / 2)
		ctxWhite.closePath()
		ctxWhite.stroke()
		ctxWhite.filter = "none"
		ctxWhite.shadowColor = "rgba(0,0,0,0)"
		ctxWhite.shadowBlur = 0
	}

	drawWhiteKeys(ctxWhite) {
		for (
			let i = Math.max(0, getRenderDimensions().minNoteNumber);
			i <= getRenderDimensions().maxNoteNumber;
			i++
		) {
			if (!isBlack(i)) {
				let dims = getRenderDimensions().getKeyDimensions(i)
				this.drawWhiteKey(ctxWhite, dims, getSetting("pianoWhiteKeyColor"))
			}
		}
	}

	drawBlackKeys(ctxBlack) {
		const renderDims = getRenderDimensions()
		const maxNote = renderDims.maxNoteNumber
		for (let i = Math.max(0, renderDims.minNoteNumber); i <= maxNote; i++) {
			if (isBlack(i)) {
				let dims = renderDims.getKeyDimensions(i)
				this.drawBlackKey(ctxBlack, dims, getSetting("pianoBlackKeyColor"))
			}
		}
	}
	drawWhiteKeyNames(ctx) {
		const renderDims = getRenderDimensions()
		const wKeyWd = renderDims.whiteKeyWidth
		const wKeyHt = renderDims.whiteKeyHeight
		const maxNote = renderDims.maxNoteNumber
		ctx.fillStyle = "black"
		const fontSize = wKeyWd / 2.2
		ctx.font = fontSize + "px Arial black"
		for (
			let i = Math.max(0, getRenderDimensions().minNoteNumber);
			i <= maxNote;
			i++
		) {
			let dims = renderDims.getKeyDimensions(i)
			if (!isBlack(i)) {
				let txt = formatNote(i + 21)
				let txtWd = ctx.measureText(txt).width
				ctx.fillText(
					txt,
					dims.x + dims.w / 2 - txtWd / 2,
					wKeyHt - fontSize / 2
				)
			}
		}
	}
	drawBlackKeyNames(ctx) {
		const renderDims = getRenderDimensions()
		const bKeyHt = renderDims.blackKeyHeight
		const maxNote = renderDims.maxNoteNumber
		ctx.fillStyle = "white"
		const fontSize = renderDims.blackKeyWidth / 2.1
		ctx.font = Math.ceil(fontSize) + "px Arial black"
		for (let i = Math.max(0, renderDims.minNoteNumber); i <= maxNote; i++) {
			let dims = getRenderDimensions().getKeyDimensions(i)
			if (isBlack(i)) {
				let txt = formatNote(i + 21)
				let txtWd = ctx.measureText(txt).width
				ctx.fillText(txt, dims.x + dims.w / 2 - txtWd / 2, bKeyHt * 0.9)
			}
		}
	}

	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Dimensions} dims
	 */
	drawWhiteKey(ctx, dims, color, startTimeRatio) {
		startTimeRatio = startTimeRatio || 1

		let x = dims.x + 1 * getRenderDimensions()._keyResolution
		let width = dims.w // startTimeRatio
		x -= (width - dims.w) / 2

		this.keyManager.getWhite(color).render(ctx, x, 0)
	}

	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Dimensions} dims
	 */
	drawBlackKey(ctx, dims, color, startTimeRatio) {
		startTimeRatio = startTimeRatio || 1
		color = color

		let x = dims.x
		let width = dims.w // startTimeRatio
		x -= (width - dims.w) / 2
		this.keyManager
			.getBlack(color)
			.render(
				ctx,
				x,
				(1 - startTimeRatio) * 10 * getRenderDimensions()._keyResolution
			)
	}

	getPianoCanvasWhite() {
		if (!this.pianoCanvasWhite) {
			this.pianoCanvasWhite = this.createPianoCanvas(99)
			this.ctxWhite = this.pianoCanvasWhite.getContext("2d")
		}
		return this.pianoCanvasWhite
	}
	getPlayedKeysWhite() {
		if (!this.playedKeysCanvasWhite) {
			this.playedKeysCanvasWhite = this.createPianoCanvas(99)
			this.playedKeysCtxWhite = this.playedKeysCanvasWhite.getContext("2d")
		}
		return this.playedKeysCanvasWhite
	}
	getPianoCanvasBlack() {
		if (!this.pianoCanvasBlack) {
			this.pianoCanvasBlack = this.createPianoCanvas(99)
			this.ctxBlack = this.pianoCanvasBlack.getContext("2d")
		}
		return this.pianoCanvasBlack
	}
	getPlayedKeysBlack() {
		if (!this.playedKeysCanvasBlack) {
			this.playedKeysCanvasBlack = this.createPianoCanvas(99)
			this.playedKeysCtxBlack = this.playedKeysCanvasBlack.getContext("2d")

			this.playedKeysCanvasBlack.addEventListener(
				"mousedown",
				this.onPianoMousedown.bind(this)
			)
			this.playedKeysCanvasBlack.addEventListener(
				"mouseup",
				this.onPianoMouseup.bind(this)
			)
			this.playedKeysCanvasBlack.addEventListener(
				"mousemove",
				this.onPianoMousemove.bind(this)
			)
			this.playedKeysCanvasBlack.addEventListener(
				"mouseleave",
				this.onPianoMouseleave.bind(this)
			)

			this.playedKeysCanvasBlack.addEventListener(
				"touchstart",
				this.onPianoMousedown.bind(this)
			)
			this.playedKeysCanvasBlack.addEventListener(
				"touchend",
				this.onPianoMouseup.bind(this)
			)
			this.playedKeysCanvasBlack.addEventListener(
				"touchmove",
				this.onPianoMousemove.bind(this)
			)
		}
		return this.playedKeysCanvasBlack
	}
	createPianoCanvas(zIndex) {
		const renderDims = getRenderDimensions()
		const wKeyHt = renderDims.whiteKeyHeight
		const bKeyHt = renderDims.blackKeyHeight
		const windowWd = renderDims.renderWidth
		let cnv = DomHelper.createCanvas(windowWd, Math.max(wKeyHt, bKeyHt), {
			position: "absolute",
			left: "0px",
			zIndex: zIndex,
			pointerEvents: "none"
		})
		cnv.className = "pianoCanvas"
		cnv.style.width = renderDims.windowWidth + "px"
		cnv.style.height =
			Math.max(wKeyHt, bKeyHt) /*/ window.devicePixelRatio*/ + "px"
		document.body.appendChild(cnv)
		return cnv
	}
	onPianoMousedown(ev) {
		ev.preventDefault()
		if (getSetting("clickablePiano")) {
			let { x, y } = this.getCanvasPosFromMouseEvent(ev)
			let keyUnderMouse = this.getKeyAtPos(x, y)
			if (keyUnderMouse >= 0) {
				this.currentKeyUnderMouse = keyUnderMouse
				this.isMouseDown = true
				this.onNoteOn(keyUnderMouse)
			} else {
				this.clearCurrentKeyUnderMouse()
			}
		}
	}

	onPianoMouseup(ev) {
		ev.preventDefault()
		this.isMouseDown = false
		this.clearCurrentKeyUnderMouse()
	}
	onPianoMouseleave(ev) {
		ev.preventDefault()
		this.isMouseDown = false
		this.clearCurrentKeyUnderMouse()
	}

	onPianoMousemove(ev) {
		ev.preventDefault()
		if (getSetting("clickablePiano")) {
			let { x, y } = this.getCanvasPosFromMouseEvent(ev)
			let keyUnderMouse = this.getKeyAtPos(x, y)
			if (this.isMouseDown && keyUnderMouse >= 0) {
				if (this.currentKeyUnderMouse != keyUnderMouse) {
					this.onNoteOff(this.currentKeyUnderMouse)
					this.onNoteOn(keyUnderMouse)
					this.currentKeyUnderMouse = keyUnderMouse
				}
			} else {
				this.clearCurrentKeyUnderMouse()
			}
		}
	}
	clearCurrentKeyUnderMouse() {
		if (this.currentKeyUnderMouse >= 0) {
			this.onNoteOff(this.currentKeyUnderMouse)
		}
		this.currentKeyUnderMouse = -1
	}
	getKeyAtPos(x, y) {
		let clickedKey = -1
		const renderDims = getRenderDimensions()
		for (let i = 0; i <= 87; i++) {
			let dims = renderDims.getKeyDimensions(i)
			if (x > dims.x && x < dims.x + dims.w) {
				if (y > dims.y && y < dims.y + dims.h) {
					if (clickedKey == -1) {
						clickedKey = i
					} else if (isBlack(i) && !isBlack(clickedKey)) {
						clickedKey = i
						break
					}
				}
			}
		}
		return clickedKey
	}
	getCanvasPosFromMouseEvent(ev) {
		// let canvHt = Math.max(
		// 	getRenderDimensions().whiteKeyHeight,
		// 	getRenderDimensions().blackKeyHeight
		// )
		let yOffset = getRenderDimensions().getAbsolutePianoPosition()
		if (ev.clientX == undefined) {
			if (ev.touches.length) {
				return {
					x: ev.touches[ev.touches.length - 1]
						.clientX /** window.devicePixelRatio*/,
					y: ev.touches[ev.touches.length - 1].clientY - yOffset
				}
			} else {
				return { x: -1, y: -1 }
			}
		}
		let x = ev.clientX /** window.devicePixelRatio*/
		let y = ev.clientY - yOffset
		return { x, y }
	}
}
