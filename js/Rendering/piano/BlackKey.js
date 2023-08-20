import { DomHelper } from "../../ui/DomHelper.js"
import { getRenderDimensions } from "../RenderDimensions.js"
import { getRectPath } from "./WhiteKey.js"

export class BlackKey {
	constructor(opts) {
		this.margin = getRenderDimensions()._keyResolution * 3
		this.color = opts.color
		this.isActive = opts.isActive
		this.bgColor = "rgba(10,10,10,1)"
		this.topColor = opts.color
		this.outlineColor = opts.color
		this.resize(opts.w, opts.h)
	}
	generateImg() {
		let cornerRad = this.w * 0.07

		let insetW = this.w * 0.14
		let insetH = this.h * 0.08 * (this.isActive ? 0.5 : 1)

		let ct = this.c

		let topPath = getRectPath(
			insetW,
			insetW * 0.5,
			this.w - insetW * 2,
			this.h - insetH - insetW * 0.5,
			cornerRad
		)

		let backgroundPath = getRectPath(
			0,
			this.margin,
			this.w + this.margin * 2,
			this.h + this.margin,
			cornerRad * 0.75
		)
		this.outlinePath = getRectPath(0, 0, this.w, this.h, cornerRad)

		ct.fillStyle = this.bgColor
		ct.fill(backgroundPath)

		ct.save()
		ct.translate(this.margin, this.margin)

		ct.fillStyle = this.outlineColor
		ct.fill(this.outlinePath)
		ct.fillStyle = "rgba(255,255,255,0.3)"
		ct.fill(this.outlinePath)

		//complete
		let lgrBg = ct.createLinearGradient(0, 0, 0, this.h)
		lgrBg.addColorStop(0, "rgba(0,0,0,0.1)")
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
		let lgrL = ct.createLinearGradient(this.w * 1.05, 0, this.w * 0.85, 0)
		lgrL.addColorStop(0, "rgba(0,0,0,0.5)")
		lgrL.addColorStop(1, "rgba(0,0,0,0)")

		ct.fillStyle = lgrL
		ct.fill(this.outlinePath)

		let lgrF = ct.createLinearGradient(
			0,
			this.h,
			0,
			this.h * (this.isActive ? 0.99 : 0.95)
		)
		lgrF.addColorStop(0, "rgba(255,255,255,.4)")
		this.isActive ? null : lgrF.addColorStop(0.4, "rgba(255,255,255,.2)")
		lgrF.addColorStop(1, "rgba(255,255,255,0 )")

		ct.fillStyle = lgrF
		ct.fill(this.outlinePath)

		//leftLight
		let lgrLF = ct.createLinearGradient(0, 0, this.w * 0.1, 0)
		lgrLF.addColorStop(
			0,
			this.isActive ? "rgba(0,0,0,0.5 )" : "rgba(255,255,255,0.8 )"
		)
		lgrLF.addColorStop(
			1,
			this.isActive ? "rgba(0,0,0,0)" : "rgba(255,255,255,0)"
		)

		ct.fillStyle = lgrLF
		ct.fill(this.outlinePath)

		ct.fillStyle = this.topColor
		ct.fill(topPath)

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
		ct.drawImage(this.cnv, x - this.margin, y - this.margin)
	}
}
