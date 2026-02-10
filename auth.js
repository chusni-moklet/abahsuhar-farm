// Auth Protection Script
// Include this in all protected pages

(function() {
  // Cek apakah user sudah login
  if(sessionStorage.getItem('isLoggedIn') !== 'true'){
    // Redirect ke login
    window.location.href = 'login.html';
  }
})();

// Fungsi logout
function logout() {
  if(confirm('Apakah Anda yakin ingin logout?')){
    sessionStorage.clear();
    window.location.href = 'login.html';
  }
}
