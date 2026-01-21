document.addEventListener('DOMContentLoaded', function() {
    const btnAccountLink = document.getElementById('btnAccountLink');
    const accountForm = document.getElementById('accountForm');
    const overlay = document.getElementById('overlay');
    const btnCancel = document.getElementById('btnCancel');
    const btnCloseHeader = document.getElementById('btnCloseUpdate');
    const form = document.getElementById('updateAccountForm');

    accountForm.style.display = 'none';
    overlay.style.display = 'none';

    btnAccountLink.addEventListener('click', function(e) {
        e.preventDefault();
        accountForm.style.display = 'block';
        overlay.style.display = 'block';
    });

    function closeForm() {
        accountForm.style.display = 'none';
        overlay.style.display = 'none';
        form.querySelectorAll('.error-message').forEach(el => el.innerText = '');
        const successDiv = form.querySelector('.alert-success');
        if (successDiv) successDiv.innerText = '';
        form.querySelector('input[name=current_password]').value = '';
        form.querySelector('input[name=new_password]').value = '';
        form.querySelector('input[name=new_password_confirmation]').value = '';
    }

    btnCancel.addEventListener('click', closeForm);
    overlay.addEventListener('click', closeForm);
    btnCloseHeader.addEventListener('click', closeForm);

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        form.querySelectorAll('.error-message').forEach(el => el.innerText = '');
        const successDiv = form.querySelector('.alert-success');
        if (successDiv) successDiv.innerText = '';

        const formData = new FormData(form);
        const url = form.getAttribute('action');

        fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': form.querySelector('input[name=_token]').value,
                'Accept': 'application/json'
            },
            body: formData
        })
        .then(async response => {
            if (!response.ok) throw response;
            return response.json();
        })
        .then(data => {
            if (data.success) {
                let successDiv = form.querySelector('.alert-success');
                if (!successDiv) {
                    successDiv = document.createElement('div');
                    successDiv.classList.add('alert', 'alert-success');
                    successDiv.style.marginTop = '10px';
                    form.prepend(successDiv);
                }
                successDiv.innerText = data.message || 'Cập nhật thành công!';

                setTimeout(closeForm, 1000);
            }
        })
        .catch(async err => {
            if (err.status === 422) {
                const errorData = await err.json();
                for (let key in errorData.errors) {
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input) {
                        let el = input.nextElementSibling;
                        if (!el || !el.classList.contains('error-message')) {
                            el = document.createElement('div');
                            el.classList.add('error-message');
                            input.after(el);
                        }
                        el.innerText = errorData.errors[key][0];
                    }
                }
            } else {
                alert('Có lỗi xảy ra, thử lại sau.');
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const dropdowns = document.querySelectorAll(".header-nav .dropdown");

    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector("a"); 
        const menu = dropdown.querySelector(".dropdown-menu");

        trigger.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            dropdown.classList.toggle("clicked-open");

            dropdowns.forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove("clicked-open");
                }
            });
        });

        menu.addEventListener("click", function (e) {
            e.stopPropagation();
        });
    });

    document.addEventListener("click", function () {
        dropdowns.forEach(d => d.classList.remove("clicked-open"));
    });
});

(function () {
    const overlay = document.getElementById('appConfirmOverlay');
    if (!overlay) {
        window.openConfirmDialog = () => {
            console.warn('Confirm dialog not found.');
            return Promise.resolve(false);
        };
        return;
    }
    const dialog = document.getElementById('appConfirmDialog');
    const titleEl = document.getElementById('appConfirmTitle');
    const messageEl = document.getElementById('appConfirmMessage');
    const confirmBtn = document.getElementById('appConfirmOk');
    const cancelBtn = document.getElementById('appConfirmCancel');
    const closeBtn = document.getElementById('appConfirmClose');
    const iconEl = overlay.querySelector('.app-confirm-icon i');
    let resolveConfirm = null;
    let keyHandler = null;

    const closeConfirm = (result) => {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        if (resolveConfirm) {
            resolveConfirm(Boolean(result));
            resolveConfirm = null;
        }
        if (keyHandler) {
            document.removeEventListener('keydown', keyHandler);
            keyHandler = null;
        }
    };

    const openConfirmDialog = (message, options = {}) => {
        const opts = options || {};
        const msg = message || '';
        if (titleEl) titleEl.textContent = opts.title || 'Xác nhận';
        if (messageEl) messageEl.textContent = msg;
        if (confirmBtn) confirmBtn.textContent = opts.confirmText || 'Đồng ý';
        if (cancelBtn) cancelBtn.textContent = opts.cancelText || 'Hủy';
        if (dialog) dialog.dataset.variant = opts.variant || '';
        if (iconEl) iconEl.className = `fas ${opts.icon || 'fa-triangle-exclamation'}`;
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        if (confirmBtn && typeof confirmBtn.focus === 'function') {
            confirmBtn.focus();
        }
        keyHandler = (event) => {
            if (event.key === 'Escape') {
                closeConfirm(false);
            }
        };
        document.addEventListener('keydown', keyHandler);
        return new Promise(resolve => {
            resolveConfirm = resolve;
        });
    };

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeConfirm(false);
    });
    if (confirmBtn) confirmBtn.addEventListener('click', () => closeConfirm(true));
    if (cancelBtn) cancelBtn.addEventListener('click', () => closeConfirm(false));
    if (closeBtn) closeBtn.addEventListener('click', () => closeConfirm(false));

    window.openConfirmDialog = openConfirmDialog;
})();

document.addEventListener('DOMContentLoaded', () => {
    const confirmForms = document.querySelectorAll('form[data-confirm-message]');
    if (!confirmForms.length) return;
    confirmForms.forEach(form => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const message = form.dataset.confirmMessage || 'Xác nhận?';
            const title = form.dataset.confirmTitle || 'Xác nhận';
            const confirmText = form.dataset.confirmOk || 'Đồng ý';
            const cancelText = form.dataset.confirmCancel || 'Hủy';
            const icon = form.dataset.confirmIcon || 'fa-triangle-exclamation';
            if (typeof window.openConfirmDialog !== 'function') {
                if (window.confirm(message)) form.submit();
                return;
            }
            const confirmed = await window.openConfirmDialog(message, {
                title: title,
                confirmText: confirmText,
                cancelText: cancelText,
                icon: icon
            });
            if (confirmed) form.submit();
        });
    });
});
