const { Joi } = require("celebrate");

const comboFilterSchema = Joi.object()
  .keys({
    value: Joi.string().allow("").optional(),
    label: Joi.string().allow("").optional(),
  })
  .unknown(true);

const comboFilterSchemaParent = Joi.object()
  .keys({
    value: Joi.string().allow("").optional(),
    label: Joi.string().allow("").optional(),
    parent: Joi.string().allow("").optional(),
  })
  .unknown(true);

module.exports = {
  comboFilterSchema,
  comboFilterSchemaParent,
};
