const { Joi } = require("celebrate");

const BaseSchema = Joi.object().keys({
  createdDt: Joi.date().required(),
  createdBy: Joi.string().max(20).required(),
});

const PagingBaseSchema = Joi.object().keys({
  page: Joi.number().integer().min(1).optional(),
  perPage: Joi.number().integer().min(1).optional(),
  orderBy: Joi.string().allow("").optional(),
  dir: Joi.string().allow("").optional(),
});

module.exports = { BaseSchema, PagingBaseSchema };
