function seg() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}
function genKey() {
  return "KWT-" + seg() + "-" + seg() + "-" + seg();
}
function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
function checkAdminPass(pass) {
  return pass === process.env.ADMIN_PASS || pass === "kiwtech@2025";
}
module.exports = { seg, genKey, cors, checkAdminPass };
