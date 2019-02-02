'use strict';

function LineApiException(res) {
	this.name = 'LineApiException';
	this.message = JSON.stringify(res || {});
	this.response = res;
	Error.captureStackTrace(this, this.constructor.name);
}

LineApiException.prototype = Object.create(Error.prototype, {
	constructor: {
		value: LineApiException,
		enumerable: false,
		writable: true,
		configurable: true
	}
});

module.exports = LineApiException;