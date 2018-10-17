const {assert} = require('chai')

describe('User visits show page', () => {
	it('should render landing page when user clicks logo', () => {
		const expected_header = 'Video List'

		browser.url('/videos/' + Math.random())
		browser.click('.title-logo a')

		const actual_header = browser.getText('header')
		assert.strictEqual(actual_header, expected_header)
	})
})
