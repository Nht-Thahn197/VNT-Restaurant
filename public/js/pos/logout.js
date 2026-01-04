document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('logout-form').submit();
        });
    }
});
