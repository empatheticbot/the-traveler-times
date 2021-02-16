var moment = require("/node_modules/moment/min/moment.min.js");

var lastUpdatedElement = document.querySelector("#dynamic-last-updated");
var buildDate = moment("{{ computed.buildDate }}");

var weeklyResetElement = document.querySelector("#dynamic-weekly-reset-date");
var weeklyResetDate = moment("{{ destinyData.weekly.resetDate }}");

var seasonEndElement = document.querySelector("#dynamic-season-end-date");
var seasonEndDate = moment("{{ destinyData.season.endDate }}");
function updateRelativeDates() {
  console.log(buildDate.fromNow());
  lastUpdatedElement.innerText = `Updated ${buildDate.fromNow()}`;
  weeklyResetElement.innerText = `${weeklyResetDate.fromNow()}`;
  seasonEndElement.innerText = `${seasonEndDate.fromNow()}`;
}
setInterval(updateRelativeDates, 10000);
updateRelativeDates();
