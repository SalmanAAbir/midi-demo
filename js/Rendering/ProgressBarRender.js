import { getLoopManager } from "../LoopManager.js"
import { getPlayer } from "../player/Player.js"
import { addDynamicSettingsToObj } from "../settings/Settings.js"
import { drawRoundRect, formatTime, getCssVariable } from "../Util.js"
import { PROGRESS_BAR_CANVAS_HEIGHT } from "./Render.js"
import { getRenderDimensions } from "./RenderDimensions.js"
/**
 * Renders the progress bar of the song
 */
export class ProgressBarRender {
	constructor(ctx) {
		this.ctx = ctx
		this.isGrabbed = false
		this.mouseX = 0
		this.isMouseOver = false
		this.fontColor0 = "rgba(20,20,20,1)"
		this.fontColor1 = "rgba(0,0,0,1)"
		this.ctx.canvas.addEventListener(
			"mousemove",
			function (ev) {
				this.mouseX = ev.clientX /* * window.devicePixelRatio*/
				this.isMouseOver = true
			}.bind(this)
		)
		this.ctx.canvas.addEventListener(
			"mouseleave",
			function () {
				this.isMouseOver = false
			}.bind(this)
		)

		this.darkerInnerMenuBgColor = getCssVariable("darkerInnerMenuBgColor")
		this.innerMenuBgColor = getCssVariable("innerMenuBgColor")
		this.inputBgColor = getCssVariable("inputBgColor")
		this.inputBgColor = getCssVariable("inputBgColor")
		this.progressBarGreen = getCssVariable("progressBarGreen")
		this.progressBarHeight = 16
		let settingIds = ["showMiliseconds", "showMarkersTimeline"]
		addDynamicSettingsToObj(settingIds, this, "_")

		getRenderDimensions().registerResizeCallback(() => {
			this.gradient1 = this.ctx.createLinearGradient(
				getRenderDimensions().renderWidth / 2,
				0,
				getRenderDimensions().renderWidth / 2,
				PROGRESS_BAR_CANVAS_HEIGHT /** window.devicePixelRatio*/
			)
			this.gradient1.addColorStop(0, "transparent")
			// this.gradient1.addColorStop(0.1, "white")
			this.gradient1.addColorStop(0.1, this.progressBarGreen)
			this.gradient1.addColorStop(0.9, this.progressBarGreen)

			// this.gradient1.addColorStop(0.9, "black")
			this.gradient1.addColorStop(1, "transparent")
			this.gradient = this.ctx.createLinearGradient(
				getRenderDimensions().renderWidth / 2,
				0,
				getRenderDimensions().renderWidth / 2,
				PROGRESS_BAR_CANVAS_HEIGHT /** window.devicePixelRatio*/
			)
			this.gradient.addColorStop(0, "transparent")
			this.gradient.addColorStop(0.05, this.innerMenuBgColor)
			this.gradient.addColorStop(0.2, this.inputBgColor)
			this.gradient.addColorStop(0.8, this.inputBgColor)

			this.gradient.addColorStop(0.95, this.innerMenuBgColor)
			this.gradient.addColorStop(1, "transparent")
		})
	}
	setGrabbed(isGrabbed) {
		this.isGrabbed = isGrabbed
	}
	render(ctx, time, end, markers) {
		time = Math.max(0, Math.min(end, time))

		ctx.strokeStyle = "black"
		end = end / 1000

		ctx.clearRect(
			0,
			0,
			getRenderDimensions().renderWidth,
			PROGRESS_BAR_CANVAS_HEIGHT /** window.devicePixelRatio*/
		)

		ctx.globalAlpha = 1
		ctx.fillStyle = this.darkerInnerMenuBgColor

		ctx.fillRect(
			0,
			0,
			getRenderDimensions().renderWidth,
			PROGRESS_BAR_CANVAS_HEIGHT /** window.devicePixelRatio*/
		)
		ctx.globalAlpha = 1

		let barHt = parseInt(this.progressBarHeight) /** window.devicePixelRatio*/
		let marginY = this.getMarginY()
		let marginX = this.getMarginX()
		ctx.fillStyle = this.gradient
		;("rgba(210,210,210,1)")
		this.progressBarGreen
		drawRoundRect(
			ctx,
			marginX / 2 - 1,
			(PROGRESS_BAR_CANVAS_HEIGHT - barHt) / 2 - 1,
			Math.max(0, this.getX(end, end)) + 2,
			barHt + 2,
			barHt / 2 + 1,
			true
		)
		ctx.fill()

		ctx.fillStyle = this.gradient1
		getCssVariable("progressBarGreen")
		drawRoundRect(
			ctx,
			marginX / 2,
			(PROGRESS_BAR_CANVAS_HEIGHT - barHt) / 2,
			Math.max(0, this.getX(time, end)),
			barHt,
			barHt / 2,
			true
		)
		ctx.fill()

		this.renderLoop(ctx, marginX, end, barHt)

		this.renderMarkersAndTime(time, end, markers)
	}
	renderLoop(ctx, marginX, end, barHt) {
		let loopManager = getLoopManager()
		if (!loopManager.enabled) return
		let curLoop = loopManager.getCurrent()

		if (curLoop) {
			ctx.strokeStyle = "#f99e05"
			ctx.lineWidth = 3
			let startX = marginX / 2 + this.getX(curLoop.start, end)
			let endX = this.getX(curLoop.end, end) - barHt / 4 + marginX / 2
			ctx.beginPath()
			ctx.moveTo(startX, ctx.lineWidth / 2)
			ctx.lineTo(startX, PROGRESS_BAR_CANVAS_HEIGHT - ctx.lineWidth / 2)
			ctx.lineTo(endX, PROGRESS_BAR_CANVAS_HEIGHT - ctx.lineWidth / 2)
			ctx.lineTo(endX, ctx.lineWidth / 2)
			ctx.lineTo(startX, ctx.lineWidth / 2)
			ctx.stroke()
			ctx.closePath()
		}
	}

	renderMarkersAndTime(time, end, markers) {
		let ctx = this.ctx

		ctx.strokeStyle = "black"
		ctx.font = "14px Arial black"

		let midText =
			this.getTimeText(Math.min(end, time)) + " / " + this.getTimeText(end)
		let midTextWd = ctx.measureText(midText).width

		let midTextX = getRenderDimensions().renderWidth / 2 - midTextWd / 2

		let y = this.getY()

		this.coveredRanges = []

		if (this.isGrabbed) {
			let hoverTimeTxt = this.getTimeText(time)
			let grabTextWd = ctx.measureText(hoverTimeTxt).width

			let grabTextX = this.getX(time, end)
			ctx.fillStyle = this.fontColor0
			ctx.fillText(hoverTimeTxt, grabTextX, y)

			this.coveredRanges.push({
				start: grabTextX,
				end: grabTextX + grabTextWd
			})
		}

		if (this._showMarkersTimeline) {
			ctx.lineCap = "round"
			markers.forEach(marker => {
				this.renderMarker(marker, end, ctx)
			})
		}

		if (!this.isOverlap(midTextX, midTextX + midTextWd)) {
			ctx.fillStyle = this.fontColor1
			ctx.fillText(midText, midTextX, y)

			this.coveredRanges.push({
				start: midTextX,
				end: midTextX + midTextWd
			})
		}

		if (this.isMouseOver) {
			let marginX = this.getMarginX()
			let hoverTimeTxt = formatTime(
				Math.min(
					((this.mouseX - marginX / 2) /
						(getRenderDimensions().renderWidth - marginX)) *
						end,
					end
				),
				this._showMiliseconds
			)
			let grabTextWd = ctx.measureText(hoverTimeTxt).width
			let grabTextX = this.mouseX - grabTextWd / 2
			if (!this.isOverlap(grabTextX, grabTextX + grabTextWd)) {
				ctx.fillStyle = this.fontColor1
				ctx.fillText(hoverTimeTxt, grabTextX, y)
			}
		}
	}

	renderMarker(marker, end, ctx) {
		let xPos =
			(marker.timestamp / 1000 / end) * getRenderDimensions().renderWidth
		const isMouseOverMarker = Math.abs(xPos - this.mouseX) < 10
		if (isMouseOverMarker && this.isMouseOver) {
			this.renderMarkerText(ctx, marker, xPos)
		} else {
			this.renderMarkerNub(ctx, xPos)
		}
	}

	renderMarkerText(ctx, marker, xPos) {
		let y = this.getY()
		let markerTxtWd = ctx.measureText(marker.text).width
		let markerX = Math.min(
			getRenderDimensions().renderWidth - markerTxtWd - 5,
			xPos - markerTxtWd / 2
		)
		markerX = Math.max(5, markerX)
		if (!this.isOverlap(markerX, markerX + markerTxtWd)) {
			ctx.fillStyle = this.fontColor0
			ctx.fillText(marker.text, markerX, y)
		}
		this.coveredRanges.push({
			start: markerX,
			end: markerX + markerTxtWd
		})
	}

	renderMarkerNub(ctx, xPos) {
		let ht = 3
		ctx.fillStyle = "rgba(240,240,240,1)"
		ctx.lineWidth = 4
		ctx.beginPath()
		ctx.moveTo(xPos, PROGRESS_BAR_CANVAS_HEIGHT /** window.devicePixelRatio*/)
		ctx.lineTo(
			xPos,
			PROGRESS_BAR_CANVAS_HEIGHT /** window.devicePixelRatio*/ - ht
		)

		ctx.stroke()
		ctx.closePath()
	}
	getTimeText(end) {
		return formatTime(end, this._showMiliseconds)
	}

	getProgressPercent(time, end) {
		return Math.max(0, time / end)
	}
	getMarginY() {
		let barHt = parseInt(this.progressBarHeight) /** window.devicePixelRatio*/
		return PROGRESS_BAR_CANVAS_HEIGHT /** window.devicePixelRatio*/ - barHt
	}
	getMarginX() {
		// let barHt = parseInt(this.progressBarHeight) /** window.devicePixelRatio*/
		return 32
		// (
		// 	PROGRESS_BAR_CANVAS_HEIGHT * 2.5 /** window.devicePixelRatio*/ - barHt
		// )
	}
	getX(time, end) {
		let margin = this.getMarginX()
		let progressPercent = this.getProgressPercent(time, end)
		return (
			(getRenderDimensions().renderWidth - margin) *
			Math.min(1, progressPercent)
		)
	}

	getY() {
		return PROGRESS_BAR_CANVAS_HEIGHT /** window.devicePixelRatio*/ / 2 + 5
	}

	isOverlap(start, end) {
		return this.coveredRanges.find(
			range => !(range.start + 5 > end || range.end < start + 5)
		)
	}
}

var theProgressBarRender = null

export const initProgressBarRenderer = ct => {
	theProgressBarRender = new ProgressBarRender(ct)
}
export const getProgressBarRender = () => {
	if (!theProgressBarRender) {
		theProgressBarRender = new ProgressBarRender()
	}
	return theProgressBarRender
}

export const getProgressBarTime = x => {
	let marginX = theProgressBarRender.getMarginX() / 2
	return (
		((x - marginX) / (getRenderDimensions().windowWidth - marginX * 2)) *
		(getPlayer().song.getEnd() / 1000)
	)
}

export const setProgressBarGrabbed = (isGrabbed = true) => {
	getProgressBarRender().setGrabbed(isGrabbed)
}
