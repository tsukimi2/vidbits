const {assert} = require('chai')
const {jsdom} = require('jsdom')
const {buildItemObject, parseTextFromHTML, fillCreateVideoFormAndSubmit} = require('../test-utils')
const {connectDatabaseAndDropData, diconnectDatabase} = require('../db-utils')

const create_page_url = '/videos/create'


describe('User visits create video page', () => {	
	describe('Posts a new video', () => {
		beforeEach(connectDatabaseAndDropData)
		afterEach(diconnectDatabase)
		
		it('should return to user landing page with added video', () => {
			const video = buildItemObject()
			fillCreateVideoFormAndSubmit(video, create_page_url)

			const body_html = browser.getHTML('body')

			assert.include(body_html, video.title)
			assert.include(body_html, video.videoUrl)
		})
	})
})