const textEl = document.getElementById("qrText");
const canvas = document.getElementById("qrCanvas");
const ctx = canvas.getContext("2d");
const msg = document.getElementById("message");

const QR_SIZE = 300;
const QUIET_ZONE = 16; // mandatory white border

let logoImg = null;

document.getElementById("logoInput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => logoImg = img;
  img.src = URL.createObjectURL(file);
});

document.getElementById("generateBtn").onclick = generateQR;
document.getElementById("copyBtn").onclick = () =>
  navigator.clipboard.writeText(textEl.value);

document.getElementById("openBtn").onclick = () => {
  if (isValidURL(textEl.value)) window.open(textEl.value, "_blank");
};

document.getElementById("downloadBtn").onclick = downloadQR;

function generateQR() {
  const text = textEl.value.trim();
  if (!text) {
    msg.textContent = "Please enter text or URL";
    return;
  }
  msg.textContent = "";

  const qr = qrcode(0, "H");
  qr.addData(text);
  qr.make();

  const cells = qr.getModuleCount();
  const cellSize = (QR_SIZE - QUIET_ZONE * 2) / cells;

  const fg = document.getElementById("qrColor").value;
  const bg = document.getElementById("bgColor").value;

  ctx.clearRect(0, 0, QR_SIZE, QR_SIZE);

  if (bg !== "transparent") {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, QR_SIZE, QR_SIZE);
  }

  ctx.fillStyle = fg;

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if (!qr.isDark(r, c)) continue;

      const x = QUIET_ZONE + c * cellSize;
      const y = QUIET_ZONE + r * cellSize;

      // Finder patterns must stay square
      if (isFinderPattern(r, c, cells)) {
        ctx.fillRect(x, y, cellSize, cellSize);
      } else {
        drawDot(x, y, cellSize);
      }
    }
  }

  if (logoImg) drawLogo();
}

function drawDot(x, y, s) {
  const style = document.getElementById("qrStyle").value;
  ctx.beginPath();

  if (style === "square") {
    ctx.fillRect(x, y, s, s);
  } else if (style === "rounded") {
    ctx.roundRect(x, y, s, s, s / 3);
    ctx.fill();
  } else {
    ctx.arc(x + s / 2, y + s / 2, s / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLogo() {
  const size = 45; // SAFE logo size (~15%)
  const x = (QR_SIZE - size) / 2;
  const y = (QR_SIZE - size) / 2;

  // White background for contrast
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(x - 6, y - 6, size + 12, size + 12, 8);
  ctx.fill();

  ctx.drawImage(logoImg, x, y, size, size);
}

function isFinderPattern(r, c, count) {
  return (
    (r < 7 && c < 7) ||
    (r < 7 && c > count - 8) ||
    (r > count - 8 && c < 7)
  );
}

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function downloadQR() {
  const link = document.createElement("a");
  link.download = "qr-code.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
