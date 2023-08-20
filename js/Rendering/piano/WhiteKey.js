import { DomHelper } from "../../ui/DomHelper.js"
import { getRenderDimensions } from "../RenderDimensions.js"

export class WhiteKey {
	constructor(opts) {
		this.margin = getRenderDimensions()._keyResolution * 1
		this.color = opts.color
		this.isActive = opts.isActive
		this.resize(opts.w, opts.h)
	}
	generateImg() {
		let cornerRad = this.w * 0.04

		let ct = this.c
		ct.clearRect(0, 0, this.cnv.width, this.cnv.height)

		this.outlinePath = getRectPath(0, 0, this.w, this.h, cornerRad)

		ct.fillStyle = "rgba(240,240,240,1)"
		ct.save()
		ct.translate(this.margin, this.margin)
		ct.fill(this.outlinePath)

		ct.globalAlpha = 0.5
		ct.fillStyle = this.color
		ct.fill(this.outlinePath)
		ct.globalCompositeOperation = "darker"
		ct.globalAlpha = 1

		//complete
		let lgrBg = ct.createLinearGradient(0, 0, 0, this.h)
		lgrBg.addColorStop(0, "rgba(0,0,0,0.2)")
		lgrBg.addColorStop(1, "rgba(0,0,0,0)")

		ct.fillStyle = lgrBg
		ct.fill(this.outlinePath)
		//topShade
		let lgr = ct.createLinearGradient(0, -10, 0, this.h * 0.1)
		lgr.addColorStop(0, "rgba(0,0,0,0.3)")
		lgr.addColorStop(0.1, "rgba(0,0,0,0.1)")
		lgr.addColorStop(1, "rgba(0,0,0,0)")

		ct.fillStyle = lgr
		ct.fill(this.outlinePath)

		//rightShade
		let lgrL = ct.createLinearGradient(
			this.w * 1.0,
			0,
			this.w * (this.isActive ? 1 : 0.95),
			0
		)
		lgrL.addColorStop(0, "rgba(0,0,0,.5)")
		lgrL.addColorStop(1, "rgba(0,0,0,0)")

		ct.fillStyle = lgrL
		ct.fill(this.outlinePath)

		ct.globalCompositeOperation = "lighter"

		if (!this.isActive) {
			//frontLight
			let lgrF = ct.createLinearGradient(
				0,
				this.h,
				0,
				this.h * (this.isActive ? 1 : 0.975)
			)
			lgrF.addColorStop(0, "rgba(255,255,255,.6)")
			lgrF.addColorStop(1, "rgba(255,255,255,0 )")

			ct.fillStyle = lgrF
			ct.fill(this.outlinePath)
		}

		//leftLight
		let lgrLF = ct.createLinearGradient(0, 0, this.w * 0.075, 0)
		lgrLF.addColorStop(
			0,
			this.isActive ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5 )"
		)
		lgrLF.addColorStop(
			1,
			this.isActive ? "rgba(0,0,0,0)" : "rgba(255,255,255,0 )"
		)

		ct.fillStyle = lgrLF
		ct.fill(this.outlinePath)

		ct.globalCompositeOperation = "source-over"
		ct.restore()
	}
	resize(w, h) {
		this.w = w
		this.h = h
		let cnv = this.getCnv()
		cnv.width = w + this.margin * 2
		cnv.height = h + this.margin * 2
		this.generateImg()
	}
	getCnv() {
		if (!this.cnv) {
			this.cnv = DomHelper.createCanvas(this.w, this.h)
			this.c = this.cnv.getContext("2d")
		}
		return this.cnv
	}
	render(ct, x, y) {
		ct.drawImage(this.cnv, x - this.margin, y)
	}
}

class Vec2 {
	constructor(x, y) {
		this.x = x
		this.y = y
	}
	moveTo(ct) {
		ct.moveTo(this.x, this.y)
	}
	lineTo(ct) {
		ct.lineTo(this.x, this.y)
	}
}

export function getRectPath(x, y, w, h, cornerRad) {
	let tl0 = new Vec2(x, y + cornerRad)
	let tl1 = new Vec2(x + cornerRad, y)

	let tr0 = new Vec2(x + w - cornerRad, y)
	let tr1 = new Vec2(x + w, y + cornerRad)

	let bl0 = new Vec2(x + cornerRad, y + h)
	let bl1 = new Vec2(x, y + h - cornerRad)

	let br0 = new Vec2(x + w, y + h - cornerRad)
	let br1 = new Vec2(x + w - cornerRad, y + h)

	let path = new Path2D()
	tl0.moveTo(path)
	tl1.lineTo(path)
	tr0.lineTo(path)
	tr1.lineTo(path)
	br0.lineTo(path)
	br1.lineTo(path)
	bl0.lineTo(path)
	bl1.lineTo(path)
	tl0.lineTo(path)

	return path
}
