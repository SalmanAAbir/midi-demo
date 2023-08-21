const staticDevMidiano = "midiano-v1.02"
const expectedCaches = [staticDevMidiano]
const assets = [
	"/",
	"/manifest.json",

	"/index.html",
	"/blackKey.svg",
	"/LandingPageGenerator.js",
	"/serviceWorker.js",

	"/css/bootstrap-theme.min.css",
	"/css/bootstrap.min.css",
	"/css/Inputs.css",
	"/css/Interface.css",
	"/css/landingPage.css",
	"/css/nano.min.css",
	"/css/Settings.css",

	"/favicons/browserconfig.xml",
	"/favicons/favicon-512.png",
	"/favicons/favicon-384.png",
	"/favicons/favicon-128.png",
	"/favicons/favicon-114.png",
	"/favicons/favicon-120.png",
	"/favicons/favicon-144.png",
	"/favicons/favicon-150.png",
	"/favicons/favicon-152.png",
	"/favicons/favicon-16.png",
	"/favicons/favicon-160.png",
	"/favicons/favicon-180.png",
	"/favicons/favicon-192.png",
	"/favicons/favicon-310.png",
	"/favicons/favicon-32.png",
	"/favicons/favicon-57.png",
	"/favicons/favicon-60.png",
	"/favicons/favicon-64.png",
	"/favicons/favicon-70.png",
	"/favicons/favicon-72.png",
	"/favicons/favicon-76.png",
	"/favicons/favicon-96.png",
	"/favicons/favicon.ico",

	"/FluidR3_GM/percussion-mp3.js",
	"/FluidR3_GM/percussion-ogg.js",

	"/fonts/glyphicons-halflings-regular.eot",
	"/fonts/glyphicons-halflings-regular.svg",
	"/fonts/glyphicons-halflings-regular.ttf",
	"/fonts/glyphicons-halflings-regular.woff",
	"/fonts/glyphicons-halflings-regular.woff2",

	"/HQSoundfont/acoustic_grand_piano-mp3.js",
	"/HQSoundfont/acoustic_grand_piano-ogg.js",

	"/images/accidentalFlat.svg",
	"/images/accidentalNatural.svg",
	"/images/accidentalSharp.svg",
	"/images/IconLogo.svg",
	"/images/TwitterLogo.svg",
	"/images/TwitterLogo.png",
	"/images/bgPattern.png",
	"/images/bgScreenshot.png",
	"/images/bgScreenshot2.png",
	"/images/fav.svg",
	"/images/favicon.png",

	"/images/logo3.svg",
	"/images/notehead.svg",
	"/images/openGraphScreen.webp",
	"/images/screenShotNew.webp",
	"/images/subtitle.svg",
	"/images/socials/RedditGrey.svg",
	"/images/socials/TwitterGrey.svg",
	"/images/socials/DiscordGrey.svg",

	"/images/particles/circle_01.png",
	"/images/particles/circle_02.png",
	"/images/particles/circle_03.png",
	"/images/particles/circle_04.png",
	"/images/particles/circle_05.png",
	"/images/particles/dirt_01.png",
	"/images/particles/dirt_02.png",
	"/images/particles/dirt_03.png",
	"/images/particles/fire_01.png",
	"/images/particles/fire_02.png",
	"/images/particles/flame_01.png",
	"/images/particles/flame_02.png",
	"/images/particles/flame_03.png",
	"/images/particles/flame_04.png",
	"/images/particles/flame_05.png",
	"/images/particles/flame_06.png",
	"/images/particles/flare_01.png",
	"/images/particles/light_01.png",
	"/images/particles/light_02.png",
	"/images/particles/light_03.png",
	"/images/particles/magic_01.png",
	"/images/particles/magic_02.png",
	"/images/particles/magic_03.png",
	"/images/particles/magic_04.png",
	"/images/particles/magic_05.png",
	"/images/particles/muzzle_01.png",
	"/images/particles/muzzle_02.png",
	"/images/particles/muzzle_03.png",
	"/images/particles/muzzle_04.png",
	"/images/particles/muzzle_05.png",
	"/images/particles/scorch_01.png",
	"/images/particles/scorch_02.png",
	"/images/particles/scorch_03.png",
	"/images/particles/scratch_01.png",
	"/images/particles/slash_01.png",
	"/images/particles/slash_02.png",
	"/images/particles/slash_03.png",
	"/images/particles/slash_04.png",
	"/images/particles/smoke_01.png",
	"/images/particles/smoke_02.png",
	"/images/particles/smoke_03.png",
	"/images/particles/smoke_04.png",
	"/images/particles/smoke_05.png",
	"/images/particles/smoke_06.png",
	"/images/particles/smoke_07.png",
	"/images/particles/smoke_08.png",
	"/images/particles/smoke_09.png",
	"/images/particles/smoke_10.png",
	"/images/particles/spark_01.png",
	"/images/particles/spark_02.png",
	"/images/particles/spark_03.png",
	"/images/particles/spark_04.png",
	"/images/particles/spark_05.png",
	"/images/particles/spark_06.png",
	"/images/particles/spark_07.png",
	"/images/particles/star_01.png",
	"/images/particles/star_02.png",
	"/images/particles/star_03.png",
	"/images/particles/star_04.png",
	"/images/particles/star_05.png",
	"/images/particles/star_06.png",
	"/images/particles/star_07.png",
	"/images/particles/star_08.png",
	"/images/particles/star_09.png",
	"/images/particles/symbol_01.png",
	"/images/particles/symbol_02.png",
	"/images/particles/trace_01.png",
	"/images/particles/trace_02.png",
	"/images/particles/trace_03.png",
	"/images/particles/trace_04.png",
	"/images/particles/trace_05.png",
	"/images/particles/trace_06.png",
	"/images/particles/trace_07.png",
	"/images/particles/twirl_01.png",
	"/images/particles/twirl_02.png",
	"/images/particles/twirl_03.png",
	"/images/particles/window_01.png",
	"/images/particles/window_02.png",
	"/images/particles/window_03.png",
	"/images/particles/window_04.png",

	"/js/InputListeners.js",
	"/js/LoopManager.js",
	"/js/jquery-3.3.1.js",
	"/js/main.js",
	"/js/MicInputHandler.js",
	"/js/MidiInputHandler.js",
	"/js/MidiLoader.js",
	"/js/Song.js",
	"/js/SongWorker.js",
	"/js/SoundfontLoader.js",
	"/js/Util.js",

	"/js/audio/AudioNote.js",
	"/js/audio/AudioPlayer.js",
	"/js/audio/Buffers.js",
	"/js/audio/GainNodeController.js",

	"/js/data/CONST.js",
	"/js/data/exampleSongs.json",

	"/js/player/FileLoader.js",
	"/js/player/Player.js",
	"/js/player/Tracks.js",

	"/js/Rendering/BackgroundRender.js",
	"/js/Rendering/DebugRender.js",
	"/js/Rendering/Flowfield.js",
	"/js/Rendering/InSongTextRenderer.js",
	"/js/Rendering/MarkerRenderer.js",
	"/js/Rendering/MeasureLinesRender.js",
	"/js/Rendering/NoteRender.js",
	"/js/Rendering/OverlayRender.js",
	"/js/Rendering/PianoParticleRender.js",
	"/js/Rendering/PianoRender.js",
	"/js/Rendering/ProgressBarRender.js",
	"/js/Rendering/Render.js",
	"/js/Rendering/RenderDimensions.js",
	"/js/Rendering/RenderUtil.js",
	"/js/Rendering/Sequencer.js",
	"/js/Rendering/StreakParticles.js",
	"/js/Rendering/SustainRenderer.js",

	"/js/Rendering/piano/WhiteKey.js",
	"/js/Rendering/piano/BlackKey.js",
	"/js/Rendering/piano/KeySpriteManager.js",

	"/js/Rendering/ThreeJs/TheeJsTextureManager.js",
	"/js/Rendering/ThreeJs/ThreeJsBuffer.js",
	"/js/Rendering/ThreeJs/threeJsHandler.js",
	"/js/Rendering/ThreeJs/threeJsParticles.js",
	"/js/Rendering/ThreeJs/threeJsPianoLine.js",
	"/js/Rendering/ThreeJs/ThreeJsSceneManager.js",

	"/js/settings/DefaultParticlePreset.js",
	"/js/settings/DefaultSettings.js",
	"/js/settings/IndexDbHandler.js",
	"/js/settings/LocalStorageHandler.js",
	"/js/settings/ParticlePreset.js",
	"/js/settings/SongSettings.js",
	"/js/settings/Settings.js",

	"/js/sheet/SheetGenerator.js",
	"/js/sheet/SheetKeyManager.js",
	"/js/sheet/SheetRender.js",

	"/js/ui/ConfirmDialog.js",
	"/js/ui/DomHelper.js",
	"/js/ui/ElementHighlight.js",
	"/js/ui/InputDialogue.js",
	"/js/ui/KeyBinder.js",
	"/js/ui/Loader.js",
	"/js/ui/Notification.js",
	"/js/ui/SettingUI.js",
	"/js/ui/SongUI.js",
	"/js/ui/TrackUI.js",
	"/js/ui/UI.js",
	"/js/ui/ZoomUI.js",

	"/lib/Base64.js",
	"/lib/Base64binary.js",
	"/lib/bootstrap.min.js",
	"/lib/goatCounter.js",
	"/lib/JASMID LICENSE.txt",
	"/lib/jquery-3.3.1.slim.min.js",
	"/lib/perlin.js",
	"/lib/sf2-parser.js",
	"/lib/three.min.js",
	"/lib/three.module1.js",
	"/lib/vexflow-debug.js",
	"/lib/vexflow-debug3.js",
	"/lib/vexflow-min.js",

	"/lib/Pickr/nano.css",
	"/lib/Pickr/pickr.es5.min.js",

	"/metronome/1.wav",
	"/metronome/2.wav",

	"/Reverb/BatteryBenson.wav",
	"/Reverb/BIG HALL E001 M2S.wav",
	"/Reverb/BIG HALL E002 M2S.wav",
	"/Reverb/BIG HALL E003 M2S.wav",
	"/Reverb/Cenzo Celestion V30 Mix 200ms.wav",
	"/Reverb/Cenzo Celestion V30 Mix 500ms.wav",
	"/Reverb/ConradPrebysConcertHallSeatF111.wav",
	"/Reverb/CORRIDOR FLUTTER ECHO E001 M2S.wav",
	"/Reverb/DAMPED CAVE E001 M2S.wav",
	"/Reverb/DAMPED CAVE E002 M2S.wav",
	"/Reverb/DAMPED CAVE E003 M2S.wav",
	"/Reverb/DAMPED CAVE E004 M2S.wav",
	"/Reverb/DAMPED CAVE E005 M2S.wav",
	"/Reverb/DUBWISE E001 M2S.wav",
	"/Reverb/FILTERVERB E001 M2S.wav",
	"/Reverb/FLANGERSPACE E001 M2S.wav",
	"/Reverb/GATED PLACE E001 M2S.wav",
	"/Reverb/HIGH DAMPING CAVE E001 M2S.wav",
	"/Reverb/HOTHALL COMP-1.wav",
	"/Reverb/JFKUnderpass.wav",
	"/Reverb/LARGE DAMPING CAVE E001 M2S.wav",
	"/Reverb/MEDIUM DAMPING CAVE E001 M2S.wav",
	"/Reverb/MEDIUM DAMPING CAVE E002 M2S.wav",
	"/Reverb/MEDIUM DAMPING ROOM E001 M2S.wav",
	"/Reverb/MEDIUM METAL ROOM E001 M2S.wav",
	"/Reverb/MEGA DIFFUSOR E001 M2S.wav",
	"/Reverb/MillsGreekTheater.wav",
	"/Reverb/NaumburgBandshell.wav",
	"/Reverb/PIPE & CARPET E001 M2S.wav",
	"/Reverb/PurgatoryChasm.wav",
	"/Reverb/REVGATEDDL1-1.wav",
	"/Reverb/ROBOTVERB-1.wav",
	"/Reverb/Space4ArtGallery.wav",
	"/Reverb/SteinmanHall.wav",
	"/Reverb/STRANGEBOX-1.wav",
	"/Reverb/TunnelToHeaven.wav",
	"/Reverb/WaterplacePark.wav",
	"/Reverb/WISSTLEPLATE-1.wav",

	"/exampleSongs/piano-midi/alb_esp1.mid",
]

self.addEventListener("install", installEvent => {
	installEvent.waitUntil(
		caches.open(staticDevMidiano).then(cache => {
			assets.forEach(asset => {
				// console.log("Installing" + asset)
				try {
					cache
						.add(asset)
						.catch(e => console.log("Error adding to cache" + asset))
				} catch (e) {
					console.log(e)
				}
			})
			// cache.addAll(assets)
		})
	)
})
self.addEventListener("activate", event => {
	// delete any caches that aren't in expectedCaches
	// which will get rid of static-v1

	event.waitUntil(
		caches
			.keys()
			.then(keys =>
				Promise.all(
					keys.map(key => {
						if (!expectedCaches.includes(key)) {
							console.log("Deleting old cache " + key)
							return caches.delete(key)
						}
					})
				)
			)
			.then(() => {
				console.log(staticDevMidiano + " now ready.")
			})
	)
})
self.addEventListener("fetch", fetchEvent => {
	fetchEvent.respondWith(
		caches
			.match(fetchEvent.request)
			.then(res => {
				if (res) {
					// console.log("Found " + fetchEvent.request.url + " in cache")
					return res
				}
				// console.log("fetching " + fetchEvent.request.url)
				return fetch(fetchEvent.request)
			})
			.catch(function (error) {
				return caches.match("index.html")
			})
	)
})
