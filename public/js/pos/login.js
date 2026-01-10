document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const errorBox = document.getElementById('loginError');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (errorBox) {
            errorBox.textContent = '';
            errorBox.style.display = 'none';
        }

        const formData = new FormData(form);
        if (e.submitter && e.submitter.name) {
            formData.set(e.submitter.name, e.submitter.value);
        }
        try {
            const actionUrl = form.getAttribute('action');
            const res = await fetch(actionUrl, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            });
            const data = await res.json();
            if (data.ok && data.redirect) {
                window.location.href = data.redirect;
                return;
            }
            const message = data.message || 'Tên đăng nhập hoặc mật khẩu chưa đúng.';
            if (errorBox) {
                errorBox.textContent = message;
                errorBox.style.display = 'flex';
            }
        } catch (err) {
            if (errorBox) {
                errorBox.textContent = 'Có lỗi xảy ra, vui lòng thử lại.';
                errorBox.style.display = 'flex';
            }
        }
    });
});