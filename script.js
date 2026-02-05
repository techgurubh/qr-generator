const textEl = document.getElementById("qrText");
const canvas = document.getElementById("qrCanvas");
const ctx = canvas.getContext("2d");
const msg = document.getElementById("message");

let logoImg = null;

document.getElementById("logoInput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => logoImg = img;
  img.src = URL.createObjectURL(file);
});

document.getElementById("generateBtn").onclick = generateQR;
document.getElementById("copyBtn").onclick = () => navigator.clipboard.writeText(textEl.value);
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

  const size = 300;
  const cells = qr.getModuleCount();
  const cellSize = size / cells;

  const fg = document.getElementById("qrColor").value;
  const bg = document.getElementById("bgColor").value;

  ctx.clearRect(0, 0, size, size);
  if (bg !== "transparent") {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
  }

  ctx.fillStyle = fg;

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if (qr.isDark(r, c)) {
        drawDot(r, c, cellSize);
      }
    }
  }

  if (logoImg) drawLogo();
}

function drawDot(r, c, s) {
  const style = document.getElementById("qrStyle").value;
  const x = c * s;
  const y = r * s;

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
  const size = 60;
  const x = (300 - size) / 2;
  const y = (300 - size) / 2;
  ctx.fillStyle = "white";
  ctx.fillRect(x - 5, y - 5, size + 10, size + 10);
  ctx.drawImage(logoImg, x, y, size, size);
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
  link.href = canvas.toDataURL();
  link.click();
}
