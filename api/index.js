const fetch = require('node-fetch');

const TOKEN = "8882518836:AAHXM2HhRUzdfWg2l-4GLmCEF9bZpJnSR88";

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    const body = req.body;
    if (!body || !body.message) return res.send({ ok: true });

    const chatId = body.message.chat.id;
    const teks = body.message.text?.trim() || "";

    if (teks === "/start") {
      await kirimPesan(chatId, "👋 Halo! Kirim nomor resi untuk melacak!");
      return res.send({ ok: true });
    }

    if (!/^\d+$/.test(teks)) return res.send({ ok: true });

    const url = "https://cek-resi-fcxf.vercel.app/cek-resi/" + teks;
    const data = await (await fetch(url)).json();

    if (!data || !data.data) {
      await kirimPesan(chatId, "❌ Resi " + teks + " tidak ditemukan!");
      return res.send({ ok: true });
    }

    const d = data.data;
    let balasan = "📦 EXPEDISI " + (d.expedisi || "-").toUpperCase() + "\n";
    balasan += "└ " + (d.expedisi || "-") + " Express\n\n";
    balasan += "📮 Resi\n";
    balasan += "├ Service : " + (d.layanan || "NONCOD") + "\n";
    balasan += "└ No Resi : " + teks + "\n\n";
    balasan += "🚦 Status\n";
    balasan += "└ Status : " + (d.status || "-") + "\n\n";
    balasan += "📤 Pengirim\n";
    balasan += "├ " + (d.pengirim?.nama || "-") + "\n";
    balasan += "└ " + (d.pengirim?.kota || "-") + "\n\n";
    balasan += "📥 Penerima\n";
    balasan += "├ " + (d.penerima?.nama || "-") + "\n";
    balasan += "└ " + (d.penerima?.kota || "-") + "\n\n";
    balasan += "📋 POD Detail\n";

    if (d.perjalanan?.length > 0) {
      d.perjalanan.forEach(item => {
        balasan += "✅ " + (item.keterangan || "") + "\n";
        balasan += "└ " + (item.tanggal || "") + "\n";
      });
    } else {
      balasan += "└ Belum ada riwayat\n";
    }

    await kirimPesan(chatId, balasan);
    return res.send({ ok: true });

  } catch (err) {
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
