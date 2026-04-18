const API_URL = "PASTE_URL_APPS_SCRIPT_DISINI";

const absensi = {
  data: {
    userId: "user-1",
    name: "Akmal",
    shift: "Shift 1",
    clockIn: null,
    breakStart: null,
    breakEnd: null,
    clockOut: null,
    overtimeStart: null,
    overtimeHours: 0,
    status: "waiting"
  },

  init() {
    this.bindButtons();
    this.liveClock();
    this.loadToday();
  },

  // ========================
  // API
  // ========================
  async loadToday() {
    try {
      const res = await fetch(`${API_URL}?action=today&userId=${this.data.userId}`);
      const json = await res.json();

      if (json.data && json.data.userId) {
        this.data = json.data;
      }

      this.updateState();
      this.updateUI();
    } catch (err) {
      console.error(err);
    }
  },

  async save() {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "save",
        payload: this.data
      })
    });

    const json = await res.json();
    this.data = json.data;

    this.updateState();
    this.updateUI();
  },

  // ========================
  // UTIL
  // ========================
  getTime() {
    return new Date().toTimeString().slice(0, 5);
  },

  liveClock() {
    setInterval(() => {
      document.getElementById("liveClock").innerText =
        new Date().toLocaleTimeString();
    }, 1000);
  },

  updateState() {
    if (this.data.clockOut) this.data.status = "completed";
    else if (this.data.breakStart && !this.data.breakEnd) this.data.status = "break";
    else if (this.data.clockIn) this.data.status = "working";
    else this.data.status = "waiting";
  },

  // ========================
  // ACTIONS
  // ========================
  async clockIn() {
    if (this.data.clockIn) return;
    this.data.clockIn = this.getTime();
    await this.save();
  },

  async breakStart() {
    if (!this.data.clockIn || this.data.breakStart) return;
    this.data.breakStart = this.getTime();
    await this.save();
  },

  async breakEnd() {
    if (!this.data.breakStart || this.data.breakEnd) return;
    this.data.breakEnd = this.getTime();
    await this.save();
  },

  async overtime() {
    if (!this.data.clockIn) return;

    const hour = new Date().getHours();
    if (hour < 20) {
      alert("Lembur hanya bisa setelah jam 20:00");
      return;
    }

    this.data.overtimeStart = this.getTime();
    await this.save();
  },

  async clockOut() {
    if (!this.data.clockIn || this.data.clockOut) return;
    this.data.clockOut = this.getTime();
    await this.save();
  },

  // ========================
  // UI
  // ========================
  updateUI() {
    document.getElementById("clockIn").innerText = this.data.clockIn || "--:--";
    document.getElementById("breakStart").innerText = this.data.breakStart || "--:--";
    document.getElementById("breakEnd").innerText = this.data.breakEnd || "--:--";
    document.getElementById("clockOut").innerText = this.data.clockOut || "--:--";
    document.getElementById("overtimeStart").innerText = this.data.overtimeStart || "--:--";
    document.getElementById("overtimeHours").innerText = (this.data.overtimeHours || 0) + " jam";

    // STATUS TEXT
    let status = "Siap Clock In";
    if (this.data.status === "working") status = "Sedang Bekerja";
    if (this.data.status === "break") status = "Istirahat";
    if (this.data.status === "completed") status = "Selesai";

    document.getElementById("statusText").innerText = status;

    // BUTTON STATE
    document.getElementById("btnIn").disabled = !!this.data.clockIn;
    document.getElementById("btnBreak").disabled = !this.data.clockIn || !!this.data.breakStart;
    document.getElementById("btnAfterBreak").disabled = !this.data.breakStart || !!this.data.breakEnd;
    document.getElementById("btnOut").disabled = !this.data.clockIn || !!this.data.clockOut;

    // 🔥 OVERTIME SELALU AKTIF SETELAH CLOCK IN
    document.getElementById("btnOvertime").disabled = !this.data.clockIn;
  },

  bindButtons() {
    document.getElementById("btnIn").onclick = () => this.clockIn();
    document.getElementById("btnBreak").onclick = () => this.breakStart();
    document.getElementById("btnAfterBreak").onclick = () => this.breakEnd();
    document.getElementById("btnOvertime").onclick = () => this.overtime();
    document.getElementById("btnOut").onclick = () => this.clockOut();
  }
};

window.onload = () => absensi.init();
