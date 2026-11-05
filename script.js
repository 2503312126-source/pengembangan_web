    
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// LOGIN
const loginForm = $("#loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = $("#username").value.trim();
        const password = $("#password").value;
        const message = $("#loginMessage");

        // Akun demo
        if (username === "admin" && password === "admin123") {
            sessionStorage.setItem("stbLoggedIn", "true");
            window.location.href = "dashboard.html";
        } else {
            message.textContent = "Username atau password salah!";
        }
    });
}

// DATA DEMO
const initialStudents = [
    { nama: "Kevin Nadeak", nim: "2603313039", prodi: "Informatika" },
    { nama: "Desni Agnes", nim: "2603313040", prodi: "Sistem Informasi" },
    { nama: "Andi Saputra", nim: "2603313041", prodi: "Informatika" }
];

const initialLecturers = [
    { nama: "Dr. Budi Santoso", nidn: "0012345678", prodi: "Informatika" },
    { nama: "Maya Putri, M.Kom", nidn: "0012345679", prodi: "Sistem Informasi" }
];

function getData(key, initialData) {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialData;
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// DASHBOARD
function initDashboard() {
    const sideNav = $("#sideNav");
    if (!sideNav) return;

    if (sessionStorage.getItem("stbLoggedIn") !== "true") {
        window.location.href = "index.html";
        return;
    }

    const dataSets = {
        students: {
            title: "Data Mahasiswa",
            key: "stbStudents",
            initial: initialStudents,
            fields: [
                { key: "nama", label: "Nama Mahasiswa" },
                { key: "nim", label: "NIM" },
                { key: "prodi", label: "Program Studi" }
            ]
        },
        lecturers: {
            title: "Data Dosen",
            key: "stbLecturers",
            initial: initialLecturers,
            fields: [
                { key: "nama", label: "Nama Dosen" },
                { key: "nidn", label: "NIDN" },
                { key: "prodi", label: "Program Studi" }
            ]
        },
        academic: {
            title: "Data Akademik",
            key: "stbAcademic",
            initial: [],
            fields: [
                { key: "nama", label: "Nama Kegiatan" },
                { key: "tanggal", label: "Tanggal" },
                { key: "keterangan", label: "Keterangan" }
            ]
        }
    };

    let currentPage = "overview";
    let currentData = [];
    let currentConfig = null;
    let editingIndex = -1;

    function showToast(message) {
        const toast = $("#toast");
        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }

    function updateOverview() {
        const students = getData("stbStudents", initialStudents);
        const lecturers = getData("stbLecturers", initialLecturers);

        $("#studentCount").textContent = students.length;
        $("#lecturerCount").textContent = lecturers.length;

        const recent = $("#recentStudents");
        recent.innerHTML = "";

        students.slice(0, 5).forEach((student) => {
            const row = document.createElement("tr");

            [student.nama, student.nim, student.prodi].forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            recent.appendChild(row);
        });
    }

    function renderTable() {
        const head = $("#dynamicHead");
        const body = $("#dynamicBody");
        const search = $("#tableSearch").value.toLowerCase();

        head.innerHTML = "";
        body.innerHTML = "";

        const headerRow = document.createElement("tr");

        currentConfig.fields.forEach((field) => {
            const th = document.createElement("th");
            th.textContent = field.label;
            headerRow.appendChild(th);
        });

        const actionHead = document.createElement("th");
        actionHead.textContent = "Aksi";
        headerRow.appendChild(actionHead);
        head.appendChild(headerRow);

        const filtered = currentData
            .map((record, index) => ({ record, index }))
            .filter(({ record }) =>
                Object.values(record).some(value =>
                    String(value).toLowerCase().includes(search)
                )
            );

        filtered.forEach(({ record, index }) => {
            const row = document.createElement("tr");

            currentConfig.fields.forEach((field) => {
                const cell = document.createElement("td");
                cell.textContent = record[field.key] || "-";
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.className = "secondary-button";
            editButton.addEventListener("click", () => openModal(index));

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Hapus";
            deleteButton.className = "secondary-button";
            deleteButton.style.marginLeft = "6px";
            deleteButton.addEventListener("click", () => deleteRecord(index));

            actionCell.append(editButton, deleteButton);
            row.appendChild(actionCell);
            body.appendChild(row);
        });

        $("#recordCount").textContent =
            `Menampilkan ${filtered.length} dari ${currentData.length} data`;

        $("#emptyState").hidden = currentData.length !== 0;
    }

    function openPage(page) {
        currentPage = page;

        $$(".nav-button").forEach((button) => {
            button.classList.toggle("active", button.dataset.page === page);
        });

        const isOverview = page === "overview";
        $("#overviewPage").hidden = !isOverview;
        $("#dataPage").hidden = isOverview;

        if (isOverview) {
            $("#pageTitle").textContent = "Dashboard";
            updateOverview();
            return;
        }

        currentConfig = dataSets[page];
        if (!currentConfig) return;

        currentData = getData(currentConfig.key, currentConfig.initial);
        $("#pageTitle").textContent = currentConfig.title;
        $("#dataHeading").textContent = currentConfig.title;
        $("#dataDescription").textContent = "Kelola informasi dan data universitas.";
        $("#tableSearch").value = "";
        renderTable();
    }

    function openModal(index = -1) {
        editingIndex = index;
        const isEditing = index >= 0;

        $("#modalTitle").textContent = isEditing ? "Edit Data" : "Tambah Data";
        const fieldsContainer = $("#formFields");
        fieldsContainer.innerHTML = "";

        currentConfig.fields.forEach((field) => {
            const label = document.createElement("label");
            label.textContent = field.label;

            const input = document.createElement("input");
            input.name = field.key;
            input.required = true;
            input.placeholder = `Masukkan ${field.label.toLowerCase()}`;

            if (isEditing) {
                input.value = currentData[index][field.key] || "";
            }

            fieldsContainer.append(label, input);
        });

        $("#modalBackdrop").hidden = false;
    }

    function closeModal() {
        $("#modalBackdrop").hidden = true;
        $("#recordForm").reset();
    }

    function deleteRecord(index) {
        if (!confirm("Yakin ingin menghapus data ini?")) return;

        currentData.splice(index, 1);
        saveData(currentConfig.key, currentData);
        renderTable();
        updateOverview();
        showToast("Data berhasil dihapus.");
    }

    sideNav.addEventListener("click", (event) => {
        const button = event.target.closest("[data-page]");
        if (!button) return;
        openPage(button.dataset.page);
    });

    $("#addRecordBtn").addEventListener("click", () => openModal());
    $("#closeModal").addEventListener("click", closeModal);
    $("#cancelModal").addEventListener("click", closeModal);

    $("#modalBackdrop").addEventListener("click", (event) => {
        if (event.target.id === "modalBackdrop") closeModal();
    });

    $("#recordForm").addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const newRecord = {};

        currentConfig.fields.forEach((field) => {
            newRecord[field.key] = formData.get(field.key).trim();
        });

        if (editingIndex >= 0) {
            currentData[editingIndex] = newRecord;
        } else {
            currentData.push(newRecord);
        }

        saveData(currentConfig.key, currentData);
        closeModal();
        renderTable();
        updateOverview();
        showToast("Data berhasil disimpan.");
    });

    $("#tableSearch").addEventListener("input", renderTable);

    $("#logoutBtn").addEventListener("click", () => {
        sessionStorage.removeItem("stbLoggedIn");
        window.location.href = "index.html";
    });

    updateOverview();
    openPage("overview");
}

initDashboard();
