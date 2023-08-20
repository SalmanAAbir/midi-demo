/**
 * Stores all song settings for  DB Songs in memory.
 * //TODO only load settings selectively when starting a song.
 */
class SavedTrackSettings {
	constructor() {
		this.settings = {}
	}
	setDbSongs(dbSongs) {
		dbSongs.forEach(dbSong => {
			this.settings[dbSong.fileName] = dbSong.trackSettings
		})
	}
	getSettings(fileName) {
		return this.settings[fileName]
	}
	add(fileName, trackSettings) {
		this.settings[fileName] = trackSettings
	}
	deleteSongSettings(fileName) {
		delete this.settings[fileName]
	}
}

var theSongSettings = null
export const getSongSettings = () => {
	if (!theSongSettings) {
		theSongSettings = new SavedTrackSettings()
	}
	return theSongSettings
}
