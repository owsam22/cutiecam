const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const countdownEl = document.getElementById('countdown');
const announcement = document.getElementById('announcement');
const captureBtn = document.getElementById('captureBtn');
const resultPopup = document.getElementById('resultPopup');
const finalImage = document.getElementById('finalImage');
const downloadBtn = document.getElementById('downloadBtn');
const retakeBtn = document.getElementById('retakeBtn');

let currentFilter = 'none';
let capturedImages = [];

// Start webcam
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
});

// Filter selection
document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    video.style.filter = currentFilter;
  });
});

// Countdown function
function startCountdown(callback) {
  let count = 3;
  countdownEl.textContent = count;
  const interval = setInterval(() => {
    count--;
    countdownEl.textContent = count > 0 ? count : '';
    if (count <= 0) {
      clearInterval(interval);
      callback();
    }
  }, 1000);
}

// Capture one image
function captureOne() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.filter = currentFilter;
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1); // mirror
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const data = canvas.toDataURL('image/jpeg');
  capturedImages.push(data);
  announcement.textContent = `📸 Captured photo ${capturedImages.length}`;
}

// Collage builder
function buildCollage() {
  const img = new Image();
  img.onload = () => {
    const collageCanvas = document.createElement('canvas');
    collageCanvas.width = img.width;
    collageCanvas.height = img.height * 3;
    const collageCtx = collageCanvas.getContext('2d');

    capturedImages.forEach((data, i) => {
      const tempImg = new Image();
      tempImg.onload = () => {
        collageCtx.drawImage(tempImg, 0, i * img.height);
        if (i === 2) {
          finalImage.src = collageCanvas.toDataURL('image/jpeg');
          resultPopup.classList.remove('hidden');
        }
      };
      tempImg.src = data;
    });
  };
  img.src = capturedImages[0];
}

// Capture 3-photo collage
captureBtn.addEventListener('click', async () => {
  capturedImages = [];
  announcement.textContent = '';
  for (let i = 0; i < 3; i++) {
    await new Promise(resolve => {
      startCountdown(() => {
        captureOne();
        resolve();
      });
    });
  }
  setTimeout(buildCollage, 500);
});

// Download collage
downloadBtn.addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = finalImage.src;
  a.download = 'collage.jpg';
  a.click();
});

// Retake
retakeBtn.addEventListener('click', () => {
  resultPopup.classList.add('hidden');
  capturedImages = [];
  announcement.textContent = '';
});
