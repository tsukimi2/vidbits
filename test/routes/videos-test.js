const {assert} = require('chai')
const request = require('supertest')
const {jsdom} = require('jsdom')
const app = require('../../app')
const {buildItemObject, parseTextFromHTML} = require('../test-utils')
const {connectDatabaseAndDropData, diconnectDatabase} = require('../db-utils')
const Video = require('../../models/video')

describe('/', () => {
	describe('get', () => {
		beforeEach(connectDatabaseAndDropData)
		afterEach(diconnectDatabase)

		describe('with existing video', () => {
			it('should contain video list', async () => {
				const videoOpt = buildItemObject()
				const video = new Video(videoOpt)
				await video.save()

				const response = await request(app)
					.get('/')				
				const actual_title = parseTextFromHTML(response.text, '#videos-container .video-title')
				const actual_videoUrl = jsdom(response.text).querySelector('#videos-container iframe.video-player').getAttribute('src')

				assert.include(actual_title, video.title)
				assert.include(actual_videoUrl, video.videoUrl)
			})
		})
	})
})

describe('/videos', () => {
	describe('post', () => {
		describe('without existing video', () => {
			beforeEach(connectDatabaseAndDropData)
			afterEach(diconnectDatabase)

			describe('post with empty video title', () => {
				it('should contain empty video list', async () => {
					const videoOpt = buildItemObject()
					videoOpt.title = ''

					const video = new Video(videoOpt)

					const response = await request(app)
						.post('/videos')
							.type('form')
							.send(videoOpt)

					const result = await Video.find()

					assert.isEmpty(result)
				})

				it('should receive http status 400', async () => {
					const videoOpt = buildItemObject()
					videoOpt.title = ''	

					const response = await request(app)
						.post('/videos')
							.type('form')
							.send(videoOpt)

					assert.equal(response.status, 400)
				})

				it('should render video form with title error message', async () => {
					const expected_page_title = 'Save a video'
					const expected_title_errmsg = 'Video title is required.'

					const videoOpt = buildItemObject()
					videoOpt.title = ''

					const response = await request(app)
						.post('/videos')
							.type('form')
							.send(videoOpt)

					const body_html = response.text				
					const actual_page_title = parseTextFromHTML(body_html, 'h2.title-container')
					const actual_title_errmsg = parseTextFromHTML(body_html, '#errmsg-title')

					assert.include(actual_page_title, expected_page_title)
					assert.include(actual_title_errmsg, expected_title_errmsg)
				})

				it('should render video form with description and vidoe URL fields preserved', async () => {
					const videoOpt = buildItemObject()
					videoOpt.title = ''

					const response = await request(app)
						.post('/videos')
						.type('form')
						.send(videoOpt)

					const body_html = response.text				
					const actual_videoUrl = jsdom(body_html).querySelector("#txtVideoUrl").value					
					const actual_description = jsdom(body_html).querySelector("#txtDescription").value

					assert.strictEqual(videoOpt.videoUrl, actual_videoUrl)
					assert.strictEqual(videoOpt.description, actual_description)
				})
			})

			describe('post with missing URL field', () => {
				it('should render video form with missing URL field error message', async () => {
					const expected_page_title = 'Save a video'
					const expected_url_errmsg = 'Video URL is required.'

					const videoOpt = buildItemObject()
					videoOpt.videoUrl = ''

					const response = await request(app)
						.post('/videos')
						.type('form')
						.send(videoOpt)

					const body_html = response.text
					const actual_page_title = parseTextFromHTML(body_html, 'h2.title-container')
					const actual_url_errmsg = parseTextFromHTML(body_html, 'span#errmsg-videoUrl')

					assert.strictEqual(actual_page_title, expected_page_title)
					assert.strictEqual(actual_url_errmsg, expected_url_errmsg)
				})
			})

			describe('post with valid video fields', () => {
				it('should render new video show page with http status 302', async () => {
					const videoOpt = buildItemObject()

					const response = await request(app)
						.post('/videos')
						.type('form')
						.send(videoOpt)

					const body_html = response.text				
					const actual_title = parseTextFromHTML(body_html, 'h2.title-container')
					const actual_videoUrl = jsdom(response.text).querySelector('iframe.video-player').getAttribute('src')
					const actual_description = parseTextFromHTML(body_html, '#description')

					assert.strictEqual(response.status, 302)
					assert.strictEqual(actual_title, videoOpt.title)
					assert.strictEqual(actual_videoUrl, videoOpt.videoUrl)
					assert.strictEqual(actual_description, videoOpt.description)
				})			
			})
		})
	})
})


describe('/videos/:id', () => {
	beforeEach(connectDatabaseAndDropData)
	afterEach(diconnectDatabase)

	describe('get', () => {
		it('should render specified video page with existing specified video', async () => {
			const videoOpt = buildItemObject()
			const video = new Video(videoOpt)
		
			await video.save(function(err) {
				if(err) {
					console.log('err')
					console.log(err)
				}
			})

			const response = await request(app)
				.get('/videos/' + video._id)

			const body_html = response.text

			const actual_title = parseTextFromHTML(body_html, "h2.title-container")
			const actual_description = parseTextFromHTML(body_html, "#description")

			assert.strictEqual(actual_title, videoOpt.title)
			assert.strictEqual(actual_description, videoOpt.description)
		})
	})
	
})


describe('/video/:id/edit', () => {
	beforeEach(connectDatabaseAndDropData)
	afterEach(diconnectDatabase)

	describe('get', () => {
		it('render Edit page with video submission form with text input fields populated with values from existing video', async () => {
			const expected_page_title = 'Edit a Video'

			const videoOpt = buildItemObject()
			const video = new Video(videoOpt)
		
			await video.save(function(err) {
				if(err) {
					console.log('err')
					console.log(err)
				}
			})

			await video.save(function(err) {
				if(err) {
					console.log('err')
					console.log(err)
				}				
			})

			const response = await request(app)
				.get('/videos/' + video._id + '/edit')


			const body_html = response.text
			const actual_page_title = parseTextFromHTML(body_html, 'h2.title-container')
			const actual_title = jsdom(body_html).querySelector('#txtTitle').value
			const actual_videoUrl = jsdom(body_html).querySelector('#txtVideoUrl').value
			const actual_description = jsdom(body_html).querySelector('#txtDescription').value

			assert.strictEqual(actual_page_title, expected_page_title)
			assert.strictEqual(actual_title, video.title)
			assert.strictEqual(actual_videoUrl, video.videoUrl)
			assert.strictEqual(actual_description, video.description)
		})
	})
})


describe('/videos/:id/updates', () => {
	beforeEach(connectDatabaseAndDropData)
	afterEach(diconnectDatabase)

	describe('post', () => {		
		it('should update specified video with updated video title and http status 302 rendered in video show page', async () => {
			const expected_status = 302;
			const expected_page_title = 'Show a Video'

			const videoOpt = buildItemObject()
			const video = new Video(videoOpt)
			const old_title = video.title
			const new_title = 'test2'

			try {
				await video.save()
			} catch(err) {
				console.log('err')
				console.log(err)
				assert.equal(true, false)
			}	

			videoOpt.title = new_title
		
			const response = await request(app)
				.post('/videos/' + video._id + '/updates')
				.type('form')
				.send(videoOpt)

			const body_html = response.text		
			const actual_page_title = parseTextFromHTML(body_html, 'header')
			const actual_title = parseTextFromHTML(body_html, 'h2.title-container')
			const actual_videoUrl = jsdom(body_html).querySelector('iframe.video-player').getAttribute('src')
			const actual_description = parseTextFromHTML(body_html, '#description')

			assert.strictEqual(response.status, expected_status)
			assert.strictEqual(actual_page_title, expected_page_title)
			assert.strictEqual(actual_title, new_title)
			assert.strictEqual(actual_videoUrl, videoOpt.videoUrl)
			assert.strictEqual(actual_description, videoOpt.description)
		})

		it('should not save video with invalid inputs (missing title)', async () => {
			const videoOpt = buildItemObject()
			const video = new Video(videoOpt)
			const old_title = videoOpt.title
			let updated_video = null

			try {
				await video.save()

				videoOpt.title = ''
				const response = await request(app)
					.post('/videos/' + video._id + '/updates')
					.type('form')
					.send(videoOpt)

				updated_video = await Video.findOne({ _id: video._id })
		
				assert.equal(updated_video.title, old_title)				
			} catch(err) {
				assert.equal(true, false, 'error thrown')				
			}
		})

		it('should render edit page with status 400 with title error message when saving video with missing title', async () => {
			const expected_status = 400
			const expected_page_title = 'Edit a Video'
			const expected_title_errmsg = 'Video title is required.'

			const videoOpt = buildItemObject()
			const video = new Video(videoOpt)
			const old_title = videoOpt.title

			try {
				await video.save()
			} catch(err) {
				console.log('err')
				console.log(err)
				assert.equal(true, false, 'thrown error')	
			}

			videoOpt.title = ''
			const response = await request(app)
				.post('/videos/' + video._id + '/updates')
				.type('form')
				.send(videoOpt)

			const body_html = response.text			
			const actual_page_title = parseTextFromHTML(body_html, 'h2.title-container')
			const actual_title = jsdom(body_html).querySelector('#txtTitle').value
			const actual_title_errmsg = parseTextFromHTML(body_html, 'span#errmsg-title')
			const actual_videoUrl = jsdom(body_html).querySelector('#txtVideoUrl').value
			const actual_description = jsdom(body_html).querySelector('#txtDescription').value

			assert.equal(response.status, expected_status)
			assert.strictEqual(actual_page_title, expected_page_title)
			assert.strictEqual(actual_title, old_title)
			assert.strictEqual(actual_title_errmsg, expected_title_errmsg)
			assert.strictEqual(actual_videoUrl, videoOpt.videoUrl)
			assert.strictEqual(actual_description, videoOpt.description)
		})	
	})
})


describe('/videos/:id/deletions', () => {
	beforeEach(connectDatabaseAndDropData)
	afterEach(diconnectDatabase)

	describe('post', () => {
		it('should render landing page with status 200 specified video removed', async () => {
			const expected_page_title = 'Video List'
			const expected_status = 200

			const videoOpt = buildItemObject()
			const video = new Video(videoOpt)

			try {
				await video.save()
			} catch(err) {
				console.log('err')
				console.log(err)
				assert.equal(true, false, 'thrown error')	
			}

			const response = await request(app)
				.post('/videos/' + video._id + '/deletions')
				.type('form')
				.send()

			const body_html = response.text
			const actual_page_title = parseTextFromHTML(body_html, 'header')

			assert.equal(response.status, expected_status)
			assert.strictEqual(actual_page_title, expected_page_title)
			assert.notInclude(body_html, video._id)
		})
	})
})
