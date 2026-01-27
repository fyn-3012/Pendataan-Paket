const SUPABASE_URL = "https://isdrctuepxfaffjrvxql.supabase.co/";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZHJjdHVlcHhmYWZmanJ2eHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwODM5OTYsImV4cCI6MjA3OTY1OTk5Nn0.OVUiXSYpZQZLCSkJ8DiBpNULRIvvHguqtMDZfXqqHYM";

let supabaseClient = null;
let isOfflineMode = false;
let currentUser = ""; 

window.onload = async function() {
    if(document.getElementById('inpTanggal')) {
        document.getElementById('inpTanggal').valueAsDate = new Date();
    }
    initSupabase();
};

function initSupabase() {
    try {
        if (typeof window.supabase !== 'undefined') {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            checkConnection();
        } else {
            throw new Error("Library belum termuat");
        }
    } catch (err) {
        console.error("Supabase Init Failed:", err);
        isOfflineMode = true;
        document.getElementById('loginStatus').innerHTML = `<span style="color:red">⚠️ Gagal Memuat Library (Cek Internet)</span>`;
    }
}

async function checkConnection() {
    const el = document.getElementById('loginStatus');
    const badge = document.getElementById('connectionStatus');
    const btns = document.querySelectorAll('.btn-retry');

    btns.forEach(b => b.classList.add('rotating'));
    
    if (!supabaseClient) {
        btns.forEach(b => b.classList.remove('rotating'));
        return;
    }

    const { data, error } = await supabaseClient.from('paket').select('count').limit(1);
    
    btns.forEach(b => b.classList.remove('rotating'));

    if (error) {
        console.error("Koneksi Error:", error);
        let msg = "🔴 Gagal Terhubung";
        if(error.code === "42501" || error.message.includes("policy")) {
            msg = "⚠️ Izin Ditolak (Perlu RLS)";
            alert("Koneksi tersambung tapi ditolak Database.\nJalankan perintah SQL 'Create Policy' di Supabase.");
        }
        el.innerHTML = `<span style="color:red">${msg}</span><button class="btn-retry" onclick="checkConnection()">🔄</button>`;
        badge.className = "";
        badge.innerHTML = "🔴 Offline";
        
    } else {
        console.log("Supabase Connected!");
        el.innerHTML = `<span style="color:green">🟢 Terhubung ke Cloud</span>`;
        badge.classList.add('online');
        badge.innerHTML = "🟢 Online";
        fetchData(); 
    }
}

function handleLogin() {
    const u = (document.getElementById('username').value || '').trim().toLowerCase();
    const p = (document.getElementById('password').value || '').trim().toLowerCase();

    const allowedUsers = ['andika', 'aripin', 'alfian', 'admin'];

    if(p === 'admin' && allowedUsers.includes(u)) {
        currentUser = u.charAt(0).toUpperCase() + u.slice(1); 
        
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('appScreen').classList.remove('hidden');
        document.getElementById('displayUser').innerText = `(Halo, ${currentUser})`; 
        fetchData();
    } else {
        alert("Gagal Masuk!\nUsername tidak terdaftar atau Password salah.\nHanya: Andika, Aripin, Alfian, atau Admin yang boleh masuk.");
    }
}

function handleLogout() { location.reload(); }

function showGuest() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('guestScreen').classList.remove('hidden');
    fetchData();
}

let allData = [];

async function fetchData() {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient.from('paket').select('*').order('created_at', { ascending: false });
    if (!error) {
        allData = data || [];
        updateUI();
    }
}

async function simpanKeSupabase() {
    if (!supabaseClient) return alert("Offline: Tidak bisa menyimpan.");
    
    const payload = {
        kode: document.getElementById('inpKode').value,
        nama: document.getElementById('inpNama').value,
        tanggal: document.getElementById('inpTanggal').value,
        jenis: document.getElementById('inpJenis').value || '-',
        kurir: document.getElementById('inpKurir').value || '-',
        status: document.getElementById('inpStatus').value
    };

    if(!payload.kode || !payload.nama) return alert("Wajib diisi!");

    const btn = document.querySelector('.btn-primary');
    btn.innerText = "Mengirim..."; btn.disabled = true;

    const { error } = await supabaseClient.from('paket').insert([payload]);

    btn.innerText = "💾 Simpan ke Database"; btn.disabled = false;

    if (error) {
        alert("GAGAL SIMPAN: " + error.message);
    } else {
        alert("✅ Tersimpan!");
        addToLog(`Menambahkan Paket: <b>${payload.kode}</b> - ${payload.nama}`); 
        document.getElementById('inpKode').value = "";
        document.getElementById('inpNama').value = "";
        fetchData();
    }
}

async function toggleStatus(id, currentStatus) {
    if (!supabaseClient) return;
    const newStatus = currentStatus === 'Sudah Diambil' ? 'Belum Diambil' : 'Sudah Diambil';
    
    const row = allData.find(d => d.id === id);
    if(row) {
        row.status = newStatus;
        addToLog(`Mengubah Status: <b>${row.kode}</b> menjadi ${newStatus}`);
    }
    updateUI(); 

    const { error } = await supabaseClient.from('paket').update({ status: newStatus }).eq('id', id);
    if (error) {
        alert("Gagal update: " + error.message);
        fetchData();
    }
}

async function hapusData(id) {
    if (!supabaseClient) return;
    if(!confirm("Yakin hapus?")) return;

    const item = allData.find(d => d.id === id);
    
    const { error } = await supabaseClient.from('paket').delete().eq('id', id);
    if(!error) {
        if(item) addToLog(`Menghapus Paket: <b>${item.kode}</b> (${item.nama})`);
        allData = allData.filter(d => d.id !== id);
        updateUI();
    } else {
        alert("Gagal hapus: " + error.message);
    }
}

async function fetchLogs() {
    if (!supabaseClient) return;
    const container = document.getElementById('logListContainer');
    const emptyMsg = document.getElementById('logListEmpty');
    
    emptyMsg.style.display = 'block';
    emptyMsg.innerText = 'Memuat log dari server...';
    container.innerHTML = '';

    const { data, error } = await supabaseClient
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); 

    if (error) {
        console.error("Fetch Log Error:", error);
        emptyMsg.innerHTML = '<span style="color:red">Gagal memuat log.<br>Pastikan tabel "logs" sudah dibuat di Supabase.</span>';
    } else {
        renderLogs(data);
    }
}

async function addToLog(message) {
    if (!supabaseClient) return;

    const { error } = await supabaseClient.from('logs').insert([{
        admin: currentUser || "Unknown",
        message: message
    }]);

    if(error) console.error("Gagal simpan log:", error.message);
    
    if(!document.getElementById('tabLog').classList.contains('hidden')) {
        fetchLogs();
    }
}

function renderLogs(logs) {
    const container = document.getElementById('logListContainer');
    const emptyMsg = document.getElementById('logListEmpty');

    if (!logs || logs.length === 0) {
        container.innerHTML = '';
        emptyMsg.style.display = 'block';
        emptyMsg.innerText = 'Belum ada aktivitas tercatat.';
        return;
    }

    emptyMsg.style.display = 'none';
    container.innerHTML = logs.map(log => {
        const date = new Date(log.created_at);
        const timeString = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const dateString = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

        return `
        <div class="log-item">
            <div class="log-time" style="text-align:right;">${dateString}<br>${timeString}</div>
            <div class="log-content">
                <span class="log-user">👤 ${log.admin || 'Unknown'}</span><br>
                ${log.message}
            </div>
        </div>
        `;
    }).join('');
}

async function clearLogs() {
    if(!supabaseClient) return;
    if(confirm("⚠️ PERINGATAN KERAS:\nAksi ini akan menghapus SEMUA riwayat log dari server Database.\nData log akan hilang untuk SEMUA admin.\n\nLanjutkan?")) {

        const { error } = await supabaseClient.from('logs').delete().neq('id', 0);
        
        if(error) {
            alert("Gagal menghapus log: " + error.message);
        } else {
            fetchLogs();
            alert("Server log berhasil dibersihkan.");
        }
    }
}

function updateUI() {
    renderTable(); updateStats(); guestRender();
}

function renderTable() {
    const tbody = document.querySelector('#mainTable tbody');
    const search = document.getElementById('searchBox').value.toLowerCase();
    tbody.innerHTML = '';

    const filtered = allData.filter(item => (item.nama||'').toLowerCase().includes(search) || (item.kode||'').toLowerCase().includes(search));

    if(filtered.length === 0) return tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Data kosong</td></tr>';

    filtered.forEach(item => {
        const isDone = item.status === 'Sudah Diambil';
        tbody.innerHTML += `
            <tr>
                <td><b>${item.kode}</b></td>
                <td>${item.nama}</td>
                <td>${item.tanggal}</td>
                <td>${item.kurir}</td>
                <td><span class="badge ${isDone?'badge-green':'badge-red'} cursor-pointer" onclick="toggleStatus(${item.id}, '${item.status}')">${item.status}</span></td>
                <td><button class="btn btn-danger" style="padding:4px 8px; font-size:10px;" onclick="hapusData(${item.id})">Hapus</button></td>
            </tr>
        `;
    });
}

function guestRender() {
    const tbody = document.querySelector('#guestTable tbody');
    const search = document.getElementById('guestSearch').value.toLowerCase();
    tbody.innerHTML = '';
    
    if(search.length < 1) {
        const belumDiambil = allData.filter(d => d.status !== 'Sudah Diambil');
        
        if(belumDiambil.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#999; padding:20px;">Tidak ada paket yang menunggu.</td></tr>';
        } else {
            belumDiambil.forEach(item => {
                tbody.innerHTML += `
                    <tr>
                        <td><b>${item.kode}</b></td>
                        <td>${item.nama}</td>
                        <td><span class="badge badge-red">${item.status}</span></td>
                    </tr>
                `;
            });
        }
        return;
    }
    
    const filtered = allData.filter(item => (item.nama||'').toLowerCase().includes(search) || (item.kode||'').toLowerCase().includes(search));
    
    if(filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#999;">Tidak ditemukan.</td></tr>';
        return;
    }

    filtered.forEach(item => {
        const isDone = item.status === 'Sudah Diambil';
        tbody.innerHTML += `<tr><td><b>${item.kode}</b></td><td>${item.nama}</td><td><span class="badge ${isDone?'badge-green':'badge-red'}">${item.status}</span></td></tr>`;
    });
}

function updateStats() {
    const total = allData.length;
    const sudah = allData.filter(d => d.status === 'Sudah Diambil').length;
    document.getElementById('statTotal').innerText = total;
    document.getElementById('statBelum').innerText = total - sudah;
    
    const recentList = document.getElementById('recentList');
    recentList.innerHTML = '';
    allData.slice(0, 3).forEach(d => { recentList.innerHTML += `<li><b>${d.kode}</b> - ${d.nama}</li>`; });
}

function autoKode() { document.getElementById('inpKode').value = "PKT-" + (Math.floor(Math.random() * 9000) + 1000); }

function switchTab(tabName) {
    document.getElementById('tabInput').classList.add('hidden');
    document.getElementById('tabData').classList.add('hidden');
    document.getElementById('tabLog').classList.add('hidden');

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    if(tabName === 'input') {
        document.getElementById('tabInput').classList.remove('hidden');
        event.target.classList.add('active');
    } else if(tabName === 'data') {
        document.getElementById('tabData').classList.remove('hidden');
        event.target.classList.add('active');
        renderTable();
    } else if(tabName === 'log') {
        document.getElementById('tabLog').classList.remove('hidden');
        event.target.classList.add('active');
        fetchLogs();
    }
}