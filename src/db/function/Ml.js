const moment = require("moment");
const Ml = require("../models/Ml");

async function migration(data) {
  // check duplicate time
  const time = new Date(data.time);

  const modifiedTime = new Date(
    time.getFullYear(),
    time.getMonth(),
    time.getDate(),
    time.getHours(),
    0,
    0
  );

  const _ml = new Ml({
    time: modifiedTime,
    value: data.value,
    timestamp: new Date()
  });
  const result = await _ml.save();
  return result;
}

async function list() {
  const data = await Ml.find({}).sort({ time: -1 });
  return data;
}

async function findAndUpdate(data) {
  const lastest = await getSanam(1);
  if (lastest.length > 0) {
    return await Ml.update(
      { _id: lastest[0]._id },
      { value: lastest[0].value + data.pin }
    );
  } else {
    const time = new Date();

    const modifiedTime = new Date(
      time.getFullYear(),
      time.getMonth(),
      time.getDate(),
      time.getHours(),
      0,
      0
    );
    return await Ml.create({ time: modifiedTime, value: data.pin });
  }
}

async function getSanam(hours = 0) {
  const now = new Date();

  const xDate = moment().subtract(hours + 1, "hour");

  let data = await list();

  data = data.filter(d => {
    return (
      moment(d.time).isAfter(moment(xDate), "hours") &&
      moment(d.time).isBefore(moment(), "hours")
    );
  });

  return data;
}

async function indexing() {
  const now = new Date();
  for (var i = 0; i < 500; i++) {
    const xDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours() - i,
      0,
      0,
      0
    );

    const ml = await Ml.findOne({ time: xDate });
    if (!ml) {
      Ml.create({ time: xDate, value: 0 });
    }
  }
}

module.exports = {
  migration,
  list,
  findAndUpdate,
  indexing
};
