const {assert} = require('chai')
const request = require('supertest')
const app = require('../../app')
const {buildItemObject} = require('../test-utils')
const {connectDatabaseAndDropData, diconnectDatabase} = require('../db-utils')
const Video = require('../../models/video')


describe('/videos', () => {
	describe('post', () => {
		beforeEach(connectDatabaseAndDropData)
		afterEach(diconnectDatabase)

		it('should create and save a new video', async () => {
			const video = buildItemObject()

			const response = await request(app)
				.post('/videos')
				.type('form')
				.send(video)

			const result = await Video.findOne({})

			assert.equal(result.title, video.title)
			assert.equal(result.description, video.description)
		})
	})
})
