'use strict';

/**
 * rating-and-review service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::rating-and-review.rating-and-review');
