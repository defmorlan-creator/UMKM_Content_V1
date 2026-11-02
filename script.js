
const $ = (id) => document.getElementById(id);

const STORAGE = APP_CONFIG.storagePrefix;

const ideas = [
  "Perkenalkan produk unggulan bisnis Anda",
  "Tampilkan proses pembuatan produk",
  "Ceritakan sejarah bisnis Anda",
  "Bagikan testimoni pelanggan",
  "Tampilkan keunggulan produk",
  "Buat video cara menggunakan produk",
  "Bagikan tips sesuai bidang bisnis",
  "Tampilkan produk paling laris",
  "Kenalkan tim di balik bisnis",
  "Bagikan promo mingguan",
  "Tampilkan proses pengemasan pesanan",
  "Jawab pertanyaan pelanggan",
  "Bandingkan produk sebelum dan sesudah digunakan",
  "Ceritakan pengalaman pelanggan",
  "Bagikan kesalahan umum dalam bidang bisnis Anda",
  "Tampilkan suasana toko",
  "Buat kuis sederhana",
  "Bagikan fakta menarik tentang produk",
  "Tampilkan produk dari dekat",
  "Buat konten tanya jawab",
  "Bagikan tips merawat produk",
  "Tampilkan pesanan hari ini",
  "Ceritakan tantangan membangun bisnis",
  "Kenalkan produk terbaru",
  "Buat promo paket bundling",
  "Bagikan alasan pelanggan memilih produk Anda",
  "Tampilkan ulasan pelanggan",
  "Buat konten mitos dan fakta",
  "Bagikan target bisnis bulan ini",
  "Ucapkan terima kasih kepada pelanggan"
];

const calendarTasks = ideas.map((idea, index) => ({
  day: index + 1,
  task: idea
}));

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(`${STORAGE}_${key}`);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(`${STORAGE}_${key}`, JSON.stringify(value));
}

function getProfile() {
  return readStorage("profile", {});
}

function saveProfile() {
  const profile = {
    businessName: $("businessName").value.trim(),
    businessType: $("businessType").value.trim(),
    mainProduct: $("mainProduct").value.trim(),
    targetAudience: $("targetAudience").value.trim(),
    businessAdvantage: $("businessAdvantage").value.trim(),
    contact: $("contact").value.trim()
  };

  writeStorage("profile", profile);
  $("profileMessage").textContent = "Profil bisnis berhasil disimpan.";
}

function loadProfile() {
  const profile = getProfile();

  Object.keys(profile).forEach((key) => {
    if ($(key)) $(key).value = profile[key] || "";
  });
}

function generateCaption() {
  const topic = $("captionInput").value.trim();
  const profile = getProfile();
  const product = topic || profile.mainProduct || "produk kami";
  const business = profile.businessName || "bisnis kami";
  const advantage = profile.businessAdvantage || "kualitas yang kami utamakan";
  const audience = profile.targetAudience || "Anda";

  if (!topic && !profile.mainProduct) {
    $("captionMessage").textContent = "Masukkan topik atau produk terlebih dahulu.";
    return;
  }

  const templates = {
    product: `✨ Kenalan dengan ${product} dari ${business}!\n\nKami hadir untuk membantu ${audience} mendapatkan produk yang tepat.\n\nKeunggulan kami: ${advantage}.\n\nTertarik mencoba? Hubungi kami sekarang!\n\n#UMKM #ProdukLokal #RuangDigital`,
    benefit: `Tahukah Anda manfaat ${product}?\n\nProduk yang tepat bisa membantu memenuhi kebutuhan sehari-hari Anda.\n\nDi ${business}, kami mengutamakan ${advantage}.\n\nYuk, cari tahu lebih lanjut!\n\n#TipsUMKM #ProdukPilihan`,
    promo: `🎉 PROMO SPESIAL!\n\nSaatnya mendapatkan ${product} dari ${business}.\n\nJangan lewatkan kesempatan ini. Hubungi kami untuk mengetahui penawaran yang tersedia!\n\n#PromoUMKM #BelanjaLokal`,
    education: `💡 Tips untuk Anda!\n\nSebelum memilih ${product}, pastikan Anda memahami kebutuhan dan manfaatnya.\n\nKami di ${business} selalu berusaha mengutamakan ${advantage}.\n\nSimpan postingan ini agar tidak lupa!\n\n#Edukasi #TipsBisnis`,
    engagement: `Kami ingin tahu pendapat Anda! ❤️\n\nApa hal terpenting saat memilih ${product}?\n\nA. Harga\nB. Kualitas\nC. Pelayanan\n\nTulis jawaban Anda di komentar!\n\n#DiskusiUMKM`,
    story: `Setiap bisnis punya cerita. ❤️\n\nDi ${business}, kami terus berusaha memberikan yang terbaik melalui ${product}.\n\nPerjalanan ini tidak lepas dari dukungan pelanggan seperti Anda.\n\nTerima kasih sudah menjadi bagian dari perjalanan kami!\n\n#CeritaUMKM`
  };

  $("captionResult").value = templates[$("captionType").value];
  $("captionMessage").textContent = "Caption berhasil dibuat. Silakan sesuaikan sebelum diposting.";
}

async function copyText(elementId, messageId) {
  const value = $(elementId).value.trim();

  if (!value) {
    if (messageId) $(messageId).textContent = "Belum ada teks untuk disalin.";
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    if (messageId) $(messageId).textContent = "Teks berhasil disalin.";
  } catch {
    $(elementId).select();
    document.execCommand("copy");
    if (messageId) $(messageId).textContent = "Silakan periksa teks yang disalin.";
  }
}

function saveCaption() {
  const value = $("captionResult").value.trim();

  if (!value) {
    $("captionMessage").textContent = "Buat caption terlebih dahulu.";
    return;
  }

  const saved = readStorage("captions", []);
  saved.unshift({
    text: value,
    date: new Date().toLocaleString("id-ID")
  });

  writeStorage("captions", saved);
  renderSavedCaptions();
  updateStats();
  $("captionMessage").textContent = "Caption berhasil disimpan.";
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function renderSavedCaptions() {
  const saved = readStorage("captions", []);
  const container = $("savedCaptions");

  container.innerHTML = "";

  if (saved.length === 0) {
    container.textContent = "Belum ada caption tersimpan.";
    return;
  }

  saved.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "saved-item";

    const text = document.createElement("p");
    text.textContent = `${item.date}\n${item.text}`;

    const button = document.createElement("button");
    button.className = "secondary";
    button.textContent = "Hapus";
    button.addEventListener("click", () => {
      const current = readStorage("captions", []);
      current.splice(index, 1);
      writeStorage("captions", current);
      renderSavedCaptions();
      updateStats();
    });

    div.append(text, button);
    container.appendChild(div);
  });
}

function renderIdeas(filter = "") {
  const container = $("ideaList");
  container.innerHTML = "";

  ideas.forEach((idea, index) => {
    if (!idea.toLowerCase().includes(filter.toLowerCase())) return;

    const div = document.createElement("div");
    div.className = "idea-item";

    const title = document.createElement("p");
    title.textContent = `${index + 1}. ${idea}`;

    const button = document.createElement("button");
    button.textContent = "Gunakan Ide";
    button.addEventListener("click", () => {
      $("captionInput").value = idea;
      $("captionInput").scrollIntoView({ behavior: "smooth" });
    });

    div.append(title, button);
    container.appendChild(div);
  });
}

function getCalendar() {
  return readStorage("calendar", []);
}

function renderCalendar() {
  const container = $("calendarList");
  const completed = getCalendar();

  container.innerHTML = "";

  calendarTasks.forEach((task) => {
    const div = document.createElement("div");
    div.className = "calendar-item";

    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed.includes(task.day);

    checkbox.addEventListener("change", () => {
      let current = getCalendar();

      if (checkbox.checked) {
        current.push(task.day);
      } else {
        current = current.filter((day) => day !== task.day);
      }

      writeStorage("calendar", [...new Set(current)]);
      updateStats();
    });

    const text = document.createElement("span");
    text.textContent = `Hari ${task.day}: ${task.task}`;

    label.append(checkbox, text);
    div.appendChild(label);
    container.appendChild(div);
  });

  updateStats();
}

function updateStats() {
  const saved = readStorage("captions", []);
  const completed = getCalendar();
  const percent = Math.round((completed.length / 30) * 100);

  $("captionCount").textContent = saved.length;
  $("ideaCount").textContent = ideas.length;
  $("calendarProgress").textContent = `${percent}%`;
  $("progressBar").style.width = `${percent}%`;
}

function generatePromo() {
  const product = $("promoProduct").value.trim();

  if (!product) {
    $("promoResult").value = "Masukkan nama produk terlebih dahulu.";
    return;
  }

  const profile = getProfile();
  const business = profile.businessName || "bisnis kami";

  const promoTemplates = {
    discount: `🔥 PROMO SPESIAL!\n\nDapatkan ${product} dari ${business} dengan penawaran menarik.\n\nHubungi kami sekarang untuk mengetahui diskon yang tersedia!`,
    bundle: `🎁 PAKET BUNDLING!\n\nDapatkan ${product} dalam paket spesial dari ${business}.\n\nTanyakan pilihan paket yang tersedia sekarang!`,
    new: `✨ PRODUK BARU TELAH HADIR!\n\nKenalkan ${product} dari ${business}.\n\nJadilah salah satu yang pertama mencobanya!`,
    limited: `⏰ PENAWARAN TERBATAS!\n\nJangan lewatkan kesempatan mendapatkan ${product} dari ${business}.\n\nHubungi kami untuk informasi periode promo!`,
    thanks: `❤️ TERIMA KASIH!\n\nTerima kasih telah memilih ${product} dari ${business}.\n\nDukungan Anda sangat berarti bagi perkembangan usaha kami.`
  };

  $("promoResult").value = promoTemplates[$("promoType").value];
}

function initializeApp() {
  $("saveProfile").addEventListener("click", saveProfile);
  $("generateCaption").addEventListener("click", generateCaption);
  $("copyCaption").addEventListener("click", () => copyText("captionResult", "captionMessage"));
  $("saveCaption").addEventListener("click", saveCaption);

  $("downloadCaption").addEventListener("click", () => {
    downloadText("caption-umkm.txt", $("captionResult").value);
  });

  $("ideaSearch").addEventListener("input", (event) => {
    renderIdeas(event.target.value);
  });

  $("resetCalendar").addEventListener("click", () => {
    if (confirm("Yakin ingin mengulang kalender dari awal?")) {
      writeStorage("calendar", []);
      renderCalendar();
    }
  });

  $("generatePromo").addEventListener("click", generatePromo);
  $("copyPromo").addEventListener("click", () => copyText("promoResult"));

  loadProfile();
  renderIdeas();
  renderCalendar();
  renderSavedCaptions();
  updateStats();
}

document.addEventListener("DOMContentLoaded", initializeApp);
