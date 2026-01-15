window.addEventListener('scroll', () => {
  const footer = document.querySelector('footer');
  const scrollBtn = document.getElementById('scrollButton');
  if (!footer || !scrollBtn) return;

  const footerRect = footer.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  if (footerRect.top < windowHeight - 100) {
    scrollBtn.style.bottom = `${windowHeight - footerRect.top + 100}px`;
  } else {
    scrollBtn.style.bottom = '120px';
  }
});

document.getElementById('scrollButton').addEventListener('click', () => {
  const scrollStep = -window.scrollY / 10;
  const scrollInterval = setInterval(() => {
    if (window.scrollY !== 0) {
      window.scrollBy(0, scrollStep);
    } else {
      clearInterval(scrollInterval);
    }
  }, 16);
});


const bookingButtons = document.querySelectorAll('.btn-booking');
const bookingOverlayy = document.getElementById('bookingOverlay');
const closeBookingBtn = document.getElementById('closeBooking2');

bookingButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    bookingOverlayy.classList.add('active');
  });
});

closeBookingBtn.addEventListener('click', () => {
  bookingOverlayy.classList.remove('active');
});

bookingOverlayy.addEventListener('click', (e) => {
  if (e.target === bookingOverlayy) {
    bookingOverlayy.classList.remove('active');
  }
});


document.querySelectorAll(".custom-dropdown").forEach(drop => {
  const selected = drop.querySelector(".dropdown-selected");
  const list = drop.querySelector(".dropdown-list");
  const text = drop.querySelector(".selected-text");
  const placeholder = drop.getAttribute("data-placeholder");


  selected.addEventListener("click", () => {
    document.querySelectorAll(".custom-dropdown").forEach(d => {
      if (d !== drop) d.classList.remove("open");
      d.querySelector(".dropdown-list").style.display = "none";
    });

    drop.classList.toggle("open");
    list.style.display = drop.classList.contains("open") ? "block" : "none";
  });


  list.querySelectorAll("li").forEach(item => {
    item.addEventListener("click", () => {
      text.textContent = item.textContent;
      drop.classList.remove("open");
      list.style.display = "none";
    });
  });


  document.addEventListener("click", (e) => {
    if (!drop.contains(e.target)) {
      drop.classList.remove("open");
      list.style.display = "none";
    }
  });
});


const bookingOverlay = document.getElementById("bookingOverlay");
const openBooking = document.querySelector(".btn-booking");
const closeBooking2 = document.getElementById("closeBooking2");

openBooking.addEventListener("click", () => bookingOverlay.classList.add("active"));
closeBooking2.addEventListener("click", () => bookingOverlay.classList.remove("active"));

bookingOverlay.addEventListener("click", (e) => {
  if (e.target === bookingOverlay) bookingOverlay.classList.remove("active");
});


const minusBtn = document.querySelector(".guest .minus");
const plusBtn = document.querySelector(".guest .plus");
const guestInput = document.querySelector(".guest input");

minusBtn.addEventListener("click", () => {
  if (guestInput.value > 1) {
    guestInput.value--;
  }
});

plusBtn.addEventListener("click", () => {
  guestInput.value++;
});

document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
  const selected = dropdown.querySelector('.dropdown-selected');
  const textEl = dropdown.querySelector('.selected-text');
  const hiddenInput = document.getElementById('promotion_id');
  const items = dropdown.querySelectorAll('.dropdown-list li');

  items.forEach(item => {
    item.addEventListener('click', () => {
      const value = item.getAttribute('value') || item.textContent.trim();

      textEl.textContent = item.textContent.trim();
      dropdown.dataset.value = value;

      hiddenInput.value = value;

      dropdown.classList.remove('open');
    });
  });

  selected.addEventListener('click', () => {
    dropdown.classList.toggle('open');
  });
});

// click ra ngoài thì đóng
document.addEventListener('click', e => {
  document.querySelectorAll('.custom-dropdown').forEach(dd => {
    if (!dd.contains(e.target)) {
      dd.classList.remove('open');
    }
  });
});

document.querySelector('.submit-btn').addEventListener('click', async (e) => {
    e.preventDefault();

    const customer_name = document.querySelector(
        '.booking-section input[placeholder="Tên của bạn"]'
    ).value.trim();

    const phone = document.querySelector(
        '.booking-section input[placeholder="Số điện thoại"]'
    ).value.trim();

    const locationDropdown = document.querySelector(
        '.custom-dropdown[data-placeholder="Lựa chọn cơ sở"]'
    );
    const location_id = locationDropdown?.dataset.value || '';

    const guest_count = Number(
        document.querySelector('.guest-input').value || 0
    );

    const booking_date = document.getElementById('bookingDateHidden').value;

    const timeDropdown = document.querySelector(
        '.custom-dropdown[data-placeholder="Chọn giờ"]'
    );
    const booking_time = timeDropdown?.dataset.value || '';

    const promotionDropdown = document.querySelector(
        '.custom-dropdown[data-placeholder="Chọn ưu đãi"]'
    );
    const promotion_id = promotionDropdown?.dataset.value || null;

    const note = document.querySelector('textarea').value.trim();

    if (
        !customer_name ||
        !phone ||
        !location_id ||
        guest_count <= 0 ||
        !booking_date ||
        !booking_time
    ) {
        alert('⚠️ Vui lòng nhập đầy đủ thông tin bắt buộc');
        return;
    }

    const [day, month, year] = booking_date.split('/');
    const booking_datetime = `${year}-${month}-${day} ${booking_time}:00`;

    const payload = {
        customer_name,
        phone,
        location_id,
        guest_count,
        booking_time: booking_datetime,
        promotion_id,
        note,

        items: window.currentCart || []
    };

    try {
        const CSRF_TOKEN = document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute('content');

        const res = await fetch(`${APP_URL}/booking/store`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': CSRF_TOKEN,
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.message || '❌ Đặt bàn thất bại');
            return;
        }

        alert('✅ Đặt bàn thành công! Chúng tôi sẽ liên hệ sớm.');
        document.getElementById('bookingOverlay').style.display = 'none';

    } catch (err) {
        console.error(err);
        alert('❌ Có lỗi xảy ra, vui lòng thử lại');
    }
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
        if (titleEl) titleEl.textContent = opts.title || 'Xac nhan';
        if (messageEl) messageEl.textContent = msg;
        if (confirmBtn) confirmBtn.textContent = opts.confirmText || 'Dong y';
        if (cancelBtn) cancelBtn.textContent = opts.cancelText || 'Huy';
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
