const {assert} = require('chai');
const {jsdom} = require('jsdom')
const {buildItemObject, parseTextFromHTML, fillCreateVideoFormAndSubmit} = require('../test-utils')
const {connectDatabaseAndDropData, diconnectDatabase} = require('../db-utils')

const create_page_url = '/videos/create'

const generateRandomUrl = (domain) => {
  return `http://${domain}/${Math.random()}`;
}


describe('User visits root', () => {
	describe('without existing videos', () => {
		it('starts blank', () => {
			browser.url('/');

			assert.isEmpty(browser.getText('#videos-container'))
		});
	});

	describe('with existing video', () => {
		beforeEach(connectDatabaseAndDropData)
		afterEach(diconnectDatabase)
		
		it('starts with video list', () => {
			browser.url('/')
			browser.click('a#link_create')

			const video = buildItemObject()
			fillCreateVideoFormAndSubmit(video, create_page_url)

			browser.url('/')		
			const actual_videoUrl = browser.getAttribute('iframe.video-player', 'src')
			
			assert.strictEqual(actual_videoUrl, video.videoUrl)
		})

		it('should go to show page of specified video when clicked on a video title', () => {
			const expected_page_title = 'Show a Video'

			browser.url('/')
			browser.click('a#link_create')

			const video = buildItemObject()
			fillCreateVideoFormAndSubmit(video, create_page_url)

			browser.url('/')		
			browser.click('div.video-title a')

			const body_html = browser.getHTML('body')
			const actual_page_title = parseTextFromHTML(body_html, 'header')
			const actual_video_title = parseTextFromHTML(body_html, 'h2.title-container')
			const actual_description = parseTextFromHTML(body_html, '#description')
			const actual_videoUrl = jsdom(body_html).querySelector('iframe.video-player').getAttribute('src')

			assert.strictEqual(actual_page_title, expected_page_title)
			assert.strictEqual(actual_video_title, video.title)
			assert.strictEqual(actual_description, video.description)
			assert.strictEqual(actual_videoUrl, video.videoUrl)
		})
		
	})

	describe('can navigate', () => {
		it('to create page', () => {
			browser.url('/');
			browser.click('a#link_create');

			const expected = 'Save a video';
			const result = browser.getText('h2.title-container');

			assert.include(result, expected); 
		});
	});
});
