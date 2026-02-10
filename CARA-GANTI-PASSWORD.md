# Cara Mengganti Username dan Password

## Langkah-langkah:

### 1. Buka file `login.html`

### 2. Cari bagian script dengan kode:

```javascript
const CREDENTIALS = {
  username: 'abah-suhar57',
  password: 'Kandangan2026'
};
```

### 3. Ganti username dan/atau password:

```javascript
const CREDENTIALS = {
  username: 'username-baru-anda',
  password: 'Password-Baru-Anda123'
};
```

### 4. Save file `login.html`

### 5. Selesai!

## Tips Keamanan:

### Password yang Baik:
- Minimal 8 karakter
- Kombinasi huruf besar dan kecil
- Mengandung angka
- Mengandung karakter khusus (opsional)

### Contoh Password Kuat:
- `Ternak2026!`
- `Ayam@Kampung99`
- `Dashboard#2026`

## Catatan Penting:

⚠️ **Keamanan Terbatas**

Sistem login ini menggunakan JavaScript di sisi client (browser), yang berarti:

1. **Tidak aman untuk data sensitif** - Username dan password tersimpan di file HTML yang bisa dilihat siapa saja
2. **Cocok untuk proteksi ringan** - Hanya untuk mencegah akses tidak sengaja, bukan untuk keamanan tinggi
3. **Session berbasis browser** - Login akan hilang jika browser ditutup atau sessionStorage dihapus

### Untuk Keamanan Lebih Baik:

Jika Anda memerlukan keamanan yang lebih tinggi, pertimbangkan:

1. **Backend Authentication** - Gunakan server-side authentication (PHP, Node.js, dll)
2. **Database** - Simpan kredensial di database dengan enkripsi
3. **HTTPS** - Deploy aplikasi dengan SSL/TLS
4. **Token-based Auth** - Gunakan JWT atau OAuth

### Alternatif Sederhana:

Jika ingin tetap sederhana tapi lebih aman:

1. **Google Apps Script Authentication** - Gunakan Google OAuth
2. **Firebase Authentication** - Gratis dan mudah diintegrasikan
3. **Netlify Identity** - Untuk hosting di Netlify

## Menambah User Baru:

Jika ingin menambah lebih dari 1 user, ubah struktur CREDENTIALS menjadi array:

```javascript
const CREDENTIALS = [
  { username: 'abah-suhar57', password: 'Kandangan2026' },
  { username: 'user2', password: 'Password2' },
  { username: 'user3', password: 'Password3' }
];

// Ubah juga validasi login:
loginForm.onsubmit = (e) => {
  e.preventDefault();
  
  const user = username.value.trim();
  const pass = password.value;
  
  btnLogin.disabled = true;
  btnLogin.innerHTML = '⏳ Memproses...';
  errorMsg.classList.add('hidden');
  
  setTimeout(() => {
    const validUser = CREDENTIALS.find(
      cred => cred.username === user && cred.password === pass
    );
    
    if(validUser){
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('username', user);
      window.location.href = 'dashboard.html';
    } else {
      errorMsg.classList.remove('hidden');
      btnLogin.disabled = false;
      btnLogin.innerHTML = 'Login';
      password.value = '';
      password.focus();
    }
  }, 500);
};
```

## Support:

Jika ada pertanyaan tentang login atau keamanan, silakan hubungi developer.
