document.addEventListener('DOMContentLoaded', function() {
    const btnAccountLink = document.getElementById('btnAccountLink');
    const accountForm = document.getElementById('accountForm');
    const overlay = document.getElementById('overlay');
    const btnCancel = document.getElementById('btnCancel');
    const btnCloseHeader = document.getElementById('btnCloseUpdate');
    const form = document.getElementById('updateAccountForm');

    // Mặc định ẩn
    accountForm.style.display = 'none';
    overlay.style.display = 'none';

    // Mở form khi click vào Tài khoản trong drop-down
    btnAccountLink.addEventListener('click', function(e) {
        e.preventDefault();
        accountForm.style.display = 'block';
        overlay.style.display = 'block';
    });

    // Hàm đóng form
    function closeForm() {
        accountForm.style.display = 'none';
        overlay.style.display = 'none';
        // Xóa lỗi và thông báo
        form.querySelectorAll('.error-message').forEach(el => el.innerText = '');
        const successDiv = form.querySelector('.alert-success');
        if (successDiv) successDiv.innerText = '';
        // Reset password fields
        form.querySelector('input[name=current_password]').value = '';
        form.querySelector('input[name=new_password]').value = '';
        form.querySelector('input[name=new_password_confirmation]').value = '';
    }

    btnCancel.addEventListener('click', closeForm);
    overlay.addEventListener('click', closeForm);
    btnCloseHeader.addEventListener('click', closeForm);

    // AJAX submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Xóa lỗi cũ
        form.querySelectorAll('.error-message').forEach(el => el.innerText = '');
        const successDiv = form.querySelector('.alert-success');
        if (successDiv) successDiv.innerText = '';

        const formData = new FormData(form);
        const url = form.getAttribute('action'); // Lấy URL từ action của form

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
                // Hiển thị thông báo thành công
                let successDiv = form.querySelector('.alert-success');
                if (!successDiv) {
                    successDiv = document.createElement('div');
                    successDiv.classList.add('alert', 'alert-success');
                    successDiv.style.marginTop = '10px';
                    form.prepend(successDiv);
                }
                successDiv.innerText = data.message || 'Cập nhật thành công!';

                // Đóng form sau 1 giây nếu update thành công
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


// JS Dropdown Header
document.addEventListener("DOMContentLoaded", function () {
    const dropdowns = document.querySelectorAll(".header-nav .dropdown");

    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector("a"); 
        const menu = dropdown.querySelector(".dropdown-menu");

        trigger.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Toggle class 'clicked-open'
            dropdown.classList.toggle("clicked-open");

            // Đóng dropdown khác
            dropdowns.forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove("clicked-open");
                }
            });
        });

        // Chặn click bên trong menu không đóng
        menu.addEventListener("click", function (e) {
            e.stopPropagation();
        });
    });

    // Click ra ngoài → đóng tất cả
    document.addEventListener("click", function () {
        dropdowns.forEach(d => d.classList.remove("clicked-open"));
    });
});
