const { createClient } = require("@supabase/supabase-js");
const WebSocket = require("ws");
let _client = null;
function getSupabase() {
  if (!_client) _client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { global: { fetch: fetch }, auth: { persistSession: false } });
  return _client;
}
async function getLicense(key) {
  const { data } = await getSupabase().from("licenses").select("*").eq("key", key.toUpperCase().trim()).single();
  return data;
}
async function saveLicense({ key, email, name, plan, expiry }) {
  const { error } = await getSupabase().from("licenses").insert({ key, email, name, plan, expiry, is_active: true });
  return !error;
}
async function bindMachine(key, machineId) {
  await getSupabase().from("licenses").update({ machine_id: machineId, activated_at: new Date().toISOString() }).eq("key", key);
}
async function saveOrder({ paymentId, orderId, email, name, plan, amount }) {
  await getSupabase().from("orders").insert({ razorpay_payment_id: paymentId, razorpay_order_id: orderId, email, name, plan, amount, status: "paid" });
}
async function getAllLicenses() {
  const { data } = await getSupabase().from("licenses").select("key,email,name,plan,expiry,is_active,created_at,machine_id").order("created_at", { ascending: false });
  return data || [];
}
async function deleteLicense(key) {
  const { error } = await getSupabase().from("licenses").delete().eq("key", key);
  return !error;
}
module.exports = { getLicense, saveLicense, bindMachine, saveOrder, getAllLicenses, deleteLicense };
