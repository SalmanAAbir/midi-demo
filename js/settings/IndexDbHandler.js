import { getCurrentSong } from "../player/Player.js"
import { getTracks } from "../player/Tracks.js"

class IndexDbHandler {
	constructor() {
		if (!window.indexedDB) {
			this.notSupported = true
		} else {
			this.db = null
			var request = window.indexedDB.open("UploadedSongsDb", 2)
			request.onerror = event => {
				console.log("Couldnt init DB - " + event.target.error)
			}
			request.onsuccess = event => {
				this.db = event.target.result
				console.log("DB Sucessfully initialized.")
				this.db.onerror = function (ev) {
					console.error("Database error: " + ev.target.error)
				}
			}

			request.onupgradeneeded = event => {
				this.db = event.target.result
				let objectStore = this.db.createObjectStore("savedSongs", {
					keyPath: "fileName"
				})
				objectStore.createIndex("fileName", "fileName", { unique: true })
				objectStore.transaction.oncomplete = function (event) {
					console.log(event)
				}
			}
		}
	}

	addSong(fileName, songData, trackSettings, name) {
		if (!this.db) return
		let saveObj = { fileName: fileName, song: songData, trackSettings, name }
		var transaction = this.db.transaction(["savedSongs"], "readwrite")
		transaction.oncomplete = event => {
			console.log("All done!")
		}

		transaction.onerror = event => {
			console.log("Error saving song to DB" + event.target.error)
		}

		var objectStore = transaction.objectStore("savedSongs")
		var request = objectStore.add(saveObj)
		request.onsuccess = event => {
			console.log("Song sucessfully saved " + fileName + " to DB")
		}
		request.onerror = event => {
			console.log("Error saving song to DB " + event.target.error)
		}
	}
	updateSong(fileName, trackSettings) {
		if (!this.db) return
		console.log("Updating Song Settings in DB")
		var transaction = this.db.transaction(["savedSongs"], "readwrite")
		var objectStore = transaction.objectStore("savedSongs")
		let request = objectStore.get(fileName)
		if (request) {
			request.onsuccess = evt => {
				if (evt.target.result) {
					let obj = evt.target.result
					obj.trackSettings = trackSettings
					objectStore.put(obj)
				} else {
					let obj = { fileName, trackSettings }
					this.addSong(fileName, null, trackSettings)
				}
				console.log(fileName + " updated successfully.")
				// getPlayer().loadSong(evt.target.result.song, song)
			}
			request.onerror = evt => {
				console.log(fileName + " failed to update.")
				console.log(evt.target.error)
			}
		}
	}
	removeSong(fileName) {
		if (!this.db) return
		var request = this.db
			.transaction(["savedSongs"], "readwrite")
			.objectStore("savedSongs")
			.delete(fileName)
		request.onsuccess = () =>
			console.log("Sucessfully deleted " + fileName + " from DB.")
		request.onerror = event =>
			console.log("Error deleting  " + fileName + "  -  " + event.target.error)
	}
	loadSong(songName) {
		if (!this.db) return
		var transaction = this.db.transaction(["savedSongs"])
		var objectStore = transaction.objectStore("savedSongs")
		var request = objectStore.get(songName)
		return request
	}
	async getAllSongs() {
		if (!this.db) return
		var transaction = this.db.transaction(["savedSongs"])
		var objectStore = transaction.objectStore("savedSongs")
		var myIndex = objectStore.index("fileName")
		return myIndex.getAll()
	}
}
var theDb = new IndexDbHandler()
var trackSettingsChanged = false
var lastSaveTsp = window.performance.now()
saveTrackSettings()
export const saveSongInDb = opts => {
	let { fileName, midiData, trackSettings, name } = opts
	theDb.addSong(fileName, midiData, trackSettings, name)
}

export const deleteSongInDb = songName => {
	theDb.removeSong(songName)
}
export const getSongFromDb = async fileName => theDb.loadSong(fileName)
export const getSongsFromDb = async () => theDb.getAllSongs()

export const saveCurrentTrackSettings = () => {
	trackSettingsChanged = true
}

function saveTrackSettings() {
	let now = window.performance.now()
	if (trackSettingsChanged && now - lastSaveTsp > 1000) {
		lastSaveTsp = now
		trackSettingsChanged = false
		console.log("Saving track settings")
		let curSong = getCurrentSong()
		theDb.updateSong(curSong.fileName, getTracks())
	}
	window.requestAnimationFrame(saveTrackSettings)
}
