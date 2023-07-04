const MessageList = [];
MessageList["not.found.in.master"] = "{0}: {1} not registered";
MessageList["found.duplicate"] = "Duplication found {0} : [{1}]";
MessageList["found.duplicate.0"] = "Duplication found for {0}";
MessageList["not.found"] = "Data not found";
MessageList.found = "Data found";
MessageList.create = "Data {0} inserted succesfully";
MessageList.update = "Data {0} updated succesfully";
MessageList.delete = "Data {0} deleted succesfully";
MessageList["not.access"] = "You don't have access to this data";

// eslint-disable-next-line
String.prototype.format = function (args) {
  const str = this;
  return str.replace(String.prototype.format.regex, function (item) {
    const intVal = parseInt(item.substring(1, item.length - 1));
    let replace;
    if (intVal >= 0) {
      replace = args[intVal];
    } else if (intVal === -1) {
      replace = "{";
    } else if (intVal === -2) {
      replace = "}";
    } else {
      replace = "";
    }
    return replace;
  });
};
// eslint-disable-next-line
String.prototype.format.regex = new RegExp("{-?[0-9]+}", "g");

const GetMsg = (code, ...param) => {
  return MessageList[code].format(param);
};

module.exports = { GetMsg };
