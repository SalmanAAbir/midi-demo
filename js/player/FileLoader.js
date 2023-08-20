import { getLoader } from "../ui/Loader.js"

export class FileLoader {
	static async loadSongFromURL(url, name) {
		getLoader().setLoadMessage(`Loading Song: ${name ? name : url}`)

		let fetched = await fetch(url, {
			method: "GET"
		})

		let blob = await fetched.blob()

		blob = blob.slice(0, blob.size, "audio/midi")

		let prom = new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.onload = function (theFile) {
				resolve(reader.result)
			}
			reader.onerror = () => {
				reject()
			}
			reader.readAsDataURL(blob)
		})
		return await prom
	}
}
