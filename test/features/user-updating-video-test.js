const {assert} = require('chai')
const {buildItemObject, fillCreateVideoFormAndSubmit, parseTextFromHTML} = require('../test-utils')
const {connectDatabaseAndDropData, diconnectDatabase} = require('../db-utils')

const create_page_url = '/videos/create'


describe('User visits edit page', () => {
	beforeEach(connectDatabaseAndDropData)
	afterEach(diconnectDatabase)
	
	describe('changes the video title', () => {
		it('should render show video page with updated title after saving the update', () => {
			// fill in video form on create page
			const video = buildItemObject()
			const old_title = video.title
			const new_title = 'test2'
			const expected_page_title = 'Show a Video'
			fillCreateVideoFormAndSubmit(video, create_page_url)

			// redirected to show page, then click Edit button to go to Edit page
			browser.click('#btnEdit')

			// fill in video form on Edit page
			video.title = new_title
			fillCreateVideoFormAndSubmit(video)

			// redirected to show page
			const body_html = browser.getHTML('body')		
			const actual_page_title = parseTextFromHTML(body_html, 'header')
			const actual_title = parseTextFromHTML(body_html, 'h2.title-container')
			assert.strictEqual(actual_page_title, expected_page_title)
			assert.strictEqual(actual_title, new_title)

		})

		it('should have new title found on the landing page and old title not found on the landing page after the title update', () => {
			// fill in video form on create page
			const video = buildItemObject()
			const old_title = video.title
			const new_title = 'test2'
			const expected_page_title = 'Show a Video'
			fillCreateVideoFormAndSubmit(video, create_page_url)

			// redirected to show page, then click Edit button to go to Edit page
			browser.click('#btnEdit')

			// fill in video form on Edit page and redirected to show page
			video.title = new_title
			fillCreateVideoFormAndSubmit(video)

			// go to landing page
			browser.url('/')
						
			const actual_titles = browser.getText('div.video-title a')
			assert.notInclude(actual_titles, old_title)
			assert.include(actual_titles, new_title)
		})
	})
	
})
