var assert = require('assert');

describe('Environments:', function()  {
	const ENV = 'test';
	it('ENV', function() {
		assert.equal(process.env.ENV, ENV);
	});
	it('NODE_ENV', function() {
		assert.equal(process.env.ENV, ENV);
	});
	it('BABEL_ENV', function() {
		assert.equal(process.env.ENV, ENV);
	});
});
