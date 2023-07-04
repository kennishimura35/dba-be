const { GetMsg } = require("../helper/MessageUtil");

const Ok = (res, messages, data) => {
  data = Array.isArray(data) ? data : [data];
  createMsg(res, 200, messages, data);
};

const DataCreated = (res, messages) => {
  createMsg(res, 201, messages, undefined);
};

const DataUpdated = (res, messages) => {
  createMsg(res, 200, messages, undefined);
};

const DataDeleted = (res, messages) => {
  createMsg(res, 200, messages, undefined);
};

const BadRequest = (res, messages) => {
  createMsg(res, 400, messages, undefined);
};

const NotFound = (res, messages) => {
  createMsg(res, 404, messages, undefined);
};

const Unauthorized = (res, messages) => {
  createMsg(res, 401, messages, undefined);
};

const InternalServerErr = (res, messages) => {
  createMsg(res, 500, messages, undefined);
};

const SearchOk = (
  res,
  messages,
  page,
  perPage,
  totalRows,
  totalPages,
  data
) => {
  res.append(
    "Access-Control-Expose-Headers",
    "Page, Per-Page, Total-Rows, Total-Pages"
  );
  res.append("Page", page);
  res.append("Per-Page", perPage);
  res.append("Total-Rows", totalRows);
  res.append("Total-Pages", totalPages);

  if (!messages) {
    const message = data.length > 0 ? GetMsg("found") : GetMsg("not.found");
    createMsg(res, data.length > 0 ? 200 : 404, [message], data);
  } else {
    createMsg(res, totalRows > 0 ? 200 : 404, messages, data);
  }
};

const createMsg = (res, statusCode, messages = [], data) => {
  messages = Array.isArray(messages) ? messages : [messages];
  if (!data) {
    data = undefined;
  } else {
    data = data.length == 0 ? undefined : data;
  }

  res.status(statusCode).send({
    statusCode,
    messages,
    data,
  });
};

module.exports = {
  Ok,
  BadRequest,
  DataCreated,
  DataUpdated,
  DataDeleted,
  Unauthorized,
  InternalServerErr,
  SearchOk,
  NotFound,
};
