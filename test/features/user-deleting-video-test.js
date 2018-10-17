const {assert} = require('chai')
const {jsdom} = require('jsdom')
const {buildItemObject, fillCreateVideoFormAndSubmit, parseTextFromHTML} = require('../test-utils')
const {connectDatabaseAndDropData, diconnectDatabase} = require('../db-utils')

const create_page_url = '/videos/create'


describe('User visits show page', () => {
	beforeEach(connectDatabaseAndDropData)
	afterEach(diconnectDatabase)

	describe('deletes current video by clicking Delete button', () => {
		it('should render landing page with video deleted', () => {
			const expected_page_title = 'Video List'
			let video_id = null

			// fill in video form on create page
			const video = buildItemObject()
			fillCreateVideoFormAndSubmit(video, create_page_url)

			// visits show page
			browser.url('/')
			browser.click('.video-title a')

			// clicks Delete button on show page
			const show_page_body_html = browser.getHTML('body')
			const slink_delete = jsdom(show_page_body_html).querySelector('#btnDelete').getAttribute('href')
			if(typeof slink_delete === 'string') {
				video_id = slink_delete.substring(8)
				video_id = video_id.substring(0, video_id.indexOf('/'))
			}
			browser.click('#btnDelete')

			// assert that landing page does not contain previously added video anymore
			const root_page_body_html = browser.getHTML('body')
			const actual_page_title = parseTextFromHTML(root_page_body_html, 'header')
			assert.strictEqual(actual_page_title, expected_page_title)
			assert.isEmpty(browser.getText('#videos-container'))
		})
	})
})