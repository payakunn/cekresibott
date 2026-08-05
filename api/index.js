const fetch = require('node-fetch');

const TOKEN = "8882518836:AAHXM2HhRUzdfWg2l-4GLmCEF9bZpJnSR88";

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    const body = req.body;
    if (!body || !body.message) return res.send({ ok: true });

    const chatId = body.message.chat.id;
    const teks = body.message.text?.trim() || "";

    // 👋 Pesan Sambutan
    if (teks === "/start") {
      await kirimPesan(chatId, "👋 Halo! Kirim nomor resi untuk melacak!");
      return res.send({ ok: true });
    }

    // 📦 Cek nomor resi
    if (!/^\d+$/.test(teks)) return res.send({ ok: true });

    // 🔍 Ambil data dari API
    const url = "https://cek-resi-fcxf.vercel.app/cek-resi/" + teks;
    const resApi = await fetch(url, { timeout: 15000 });
    const data = await resApi.json();

    // 📩 Susun balasan
    if (data && data.data) {
      const d = data.data;
      const ekspedisi = (d.courier || d.expedisi || "-").toUpperCase();
      const status = d.status || "-";
      const layanan = d.service || d.layanan || "NONCOD";
      const pengirimNama = d.origin?.name || d.pengirim?.nama || "-";
      const pengirimKota = d.origin?.city || d.pengirim?.kota || "-";
      const penerimaNama = d.destination?.name || d.penerima?.nama || "-";
      const penerimaKota = d.destination?.city || d.penerima?.kota || "-";

      let balasan = "📦 EXPEDISI " + ekspedisi + "\n";
      balasan += "└ " + ekspedisi + " Express\n\n";
      balasan += "📮 Resi\n";
      balasan += "├ Service : " + layanan + "\n";
      balasan += "└ No Resi : " + teks + "\n\n";
      balasan += "🚦 Status\n";
      balasan += "└ Status : " + status + "\n\n";
      balasan += "📤 Pengirim\n";
      balasan += "├ " + pengirimNama + "\n";
      balasan += "└ " + pengirimKota + "\n\n";
      balasan += "📥 Penerima\n";
      balasan += "├ " + penerimaNama + "\n";
      balasan += "└ " + penerimaKota + "\n\n";
      balasan += "📋 POD Detail\n";

      const riwayat = d.history || d.perjalanan || [];
      if (riwayat.length > 0) {
        riwayat.forEach(item => {
          balasan += "✅ " + (item.desc || item.keterangan || "") + "\n";
          balasan += "└ " + (item.date || item.tanggal || "") + "\n";
        });
      } else {
        balasan += "└ Belum ada riwayat\n";
      }

      await kirimPesan(chatId, balasan);
    } else {
      await kirimPesan(chatId, "❌ Resi " + teks + " tidak ditemukan atau belum ada datanya!");
    }

    return res.send({ ok: true });
  } catch (err) {
    console.error(err);
    return res.send({ ok: true });
  }
};

async function kirimPesan(chatId, teks) {
  await fetch("https://api.telegram.org/bot" + TOKEN + "/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: teks })
  });
}
