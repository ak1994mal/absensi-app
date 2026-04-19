const faceApp = {
  video: null,
  labeledDescriptors: [],

  async init() {
    this.video = document.getElementById("video");

    await this.loadModels();
    await this.startCamera();
    await this.loadUsersFromSheet();
    this.detectLoop();
  },

  async loadModels() {
    const URL = "https://cdn.jsdelivr.net/npm/face-api.js/models";

    await faceapi.nets.tinyFaceDetector.loadFromUri(URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(URL);
  },

  async startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    this.video.srcObject = stream;
  },

  // ==========================
  // LOAD USER DARI SHEET
  // ==========================
  async loadUsersFromSheet() {
    const res = await fetch(API_URL + "?action=getUsers");
    const json = await res.json();

    const users = json.data;

    this.labeledDescriptors = users.map(user => {
      const desc = JSON.parse(user.descriptor);
      return new faceapi.LabeledFaceDescriptors(user.name, [new Float32Array(desc)]);
    });

    this.matcher = new faceapi.FaceMatcher(this.labeledDescriptors, 0.6);
  },

  // ==========================
  // DETEKSI LOOP
  // ==========================
  async detectLoop() {
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (!detections.length) return;

      const bestMatch = this.matcher.findBestMatch(detections[0].descriptor);

      if (bestMatch.label !== "unknown") {
        this.onUserDetected(bestMatch.label);
      }
    }, 1500);
  },

  // ==========================
  // JIKA WAJAH DITEMUKAN
  // ==========================
  onUserDetected(name) {
    console.log("User detected:", name);

    // Mapping name ke userId
    const mapping = {
      "Akmal": "user-1",
      "Budi": "user-2",
      "Rizky": "user-3"
    };

    absensi.data.userId = mapping[name];
    absensi.data.name = name;

    document.getElementById("detectedUser").innerText = name;

    // AUTO lanjut ke absensi
    alert("Selamat datang " + name);
  }
};
