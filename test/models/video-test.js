const {assert} = require('chai')
const {connectDatabaseAndDropData, diconnectDatabase} = require('../db-utils')
const Video = require('../../models/video')
const {buildItemObject} = require('../test-utils')

describe('Model Video', () => {
	beforeEach(connectDatabaseAndDropData)
	afterEach(diconnectDatabase)

	describe('#title', () => {
		it('should be a string', () => {
			const n = 6
			const video = new Video({title: n})
			assert.strictEqual(video.title, n.toString())
		})

		it('should be required', () => {
			const video = new Video({})
			video.validateSync()
			assert.equal(video.errors.title.message, 'Video title is required.')
		})
	})

	describe('#description', () => {
		it('should be a string', () => {
			const videoOpt = buildItemObject({
				description: 6
			})
			const video = new Video(videoOpt)
			assert.strictEqual(video.description, videoOpt.description.toString())
		})
	})

	describe('#videoUrl', () => {
		it('should be a string', () => {
			const videoOpt = buildItemObject()
			const video = new Video(videoOpt)
			assert.strictEqual(video.videlUrl, videoOpt.videlUrl)
		})

		it('should be required', () => {
			const video = new Video({})
			video.validateSync()
			assert.strictEqual(video.errors.videoUrl.message, 'Video URL is required.')
		})
	})
})