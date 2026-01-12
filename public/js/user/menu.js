const scrollContainer = document.getElementById('menuScroll');
  const btnLeft = document.getElementById('scrollLeft');
  const btnRight = document.getElementById('scrollRight');

  const checkScroll = () => {
    const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;

    // Ẩn hiện nút
    btnLeft.classList.toggle('hidden', scrollContainer.scrollLeft <= 0);
    btnRight.classList.toggle('hidden', scrollContainer.scrollLeft >= maxScrollLeft - 1);

    // Làm mờ thẻ trong vùng fade
    const leftBoundary = scrollContainer.scrollLeft + 40; // vùng fade trái
    const rightBoundary = scrollContainer.scrollLeft + scrollContainer.clientWidth - 40; // vùng fade phải
    const links = scrollContainer.querySelectorAll('a');

    links.forEach(link => {
      const rect = link.getBoundingClientRect();
      const parentRect = scrollContainer.getBoundingClientRect();
      const linkLeft = rect.left - parentRect.left + scrollContainer.scrollLeft;
      const linkRight = rect.right - parentRect.left + scrollContainer.scrollLeft;

      if (linkRight < leftBoundary || linkLeft > rightBoundary) {
        link.classList.add('dimmed');
      } else {
        link.classList.remove('dimmed');
      }
    });
  };

  btnLeft.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: -200, behavior: 'smooth' });
  });
  btnRight.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: 200, behavior: 'smooth' });
  });

  scrollContainer.addEventListener('scroll', checkScroll);
  window.addEventListener('resize', checkScroll);
  document.addEventListener('DOMContentLoaded', checkScroll);

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

document.addEventListener("DOMContentLoaded", function () {

    const categoryLinks = document.querySelectorAll(".category-item");
    const productContent = document.getElementById("productContent");
    const baseFilterUrl = document.querySelector('meta[name="filter-url"]').content;

    // GÁN SỰ KIỆN CLICK
    categoryLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();

            // Active class
            categoryLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");

            let categoryId = this.getAttribute("data-category");

            fetch(`${baseFilterUrl}/${categoryId}`)
                .then(res => res.json())
                .then(data => {

                    productContent.innerHTML = "";

                    if (categoryId === "all") {

                        data.categories.forEach(category => {
                            let block = `
                                <h2 class="category-title">${category.name}</h2>
                                <div class="product-grid">
                            `;

                            category.products.forEach(p => {
                                block += `
                                    <div class="product-item">
                                        <img src="${p.img}" class="detail-img">
                                        <h3>${p.name}</h3>
                                        <p>${Number(p.price).toLocaleString()} đ</p>
                                        <button class="btn-add"
                                          data-id="${p.id}"
                                          data-name="${p.name}"
                                          data-price="${p.price}">
                                          + Đặt
                                        </button>
                                    </div>
                                `;
                            });

                            block += `</div>`;
                            productContent.innerHTML += block;
                        });

                    } else {
                        let block = `
                            <h2 class="category-title">${data.title}</h2>
                            <div class="product-grid">
                        `;
                        data.products.forEach(p => {
                            block += `
                                <div class="product-item">
                                    <img src="${p.img}" class="detail-img">
                                    <h3>${p.name}</h3>
                                    <p>${Number(p.price).toLocaleString()} đ</p>
                                    <button class="btn-add"
                                      data-id="${p.id}"
                                      data-name="${p.name}"
                                      data-price="${p.price}">
                                      + Đặt
                                    </button>
                                </div>
                            `;
                        });

                        block += `</div>`;
                        productContent.innerHTML = block;
                    }
                });
        });
    });

    // ⭐⭐ CLICK MẶC ĐỊNH SAU KHI GÁN EVENT
    const defaultTab = document.querySelector('.category-item[data-category="all"]');
    if (defaultTab) {
        defaultTab.click();
    } else {
        console.error("Không tìm thấy nút Tất cả!");
    }
});

let cart = [];

function updateCartUI() {
    const floatingCart = document.getElementById('openCart');
    const floatingCount = document.getElementById('floatingCount');
    const floatingTotal = document.getElementById('floatingTotal');
    const modalItems = document.getElementById('modalItems');
    const modalTotal = document.getElementById('modalTotal');

    let total = 0;
    let count = 0;
    modalItems.innerHTML = '';

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        count += item.quantity;

        modalItems.innerHTML += `
            <div class="cart-item-row">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <span>${item.price.toLocaleString()}</span>
                </div>
                <div class="item-controls">
                    <div class="qty-box">
                        <button onclick="changeQty('${item.id}', -1, event)">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQty('${item.id}', 1, event)">+</button>
                    </div>
                    <span class="item-price-total">${itemTotal.toLocaleString()}</span>
                    <button class="btn-remove-item" onclick="changeQty('${item.id}', -${item.quantity}, event)">&times;</button>
                </div>
            </div>
        `;
    });

    floatingCount.innerText = count;
    floatingTotal.innerText = total.toLocaleString();
    modalTotal.innerText = total.toLocaleString();

    if (count > 0) {
        floatingCart.classList.add('show');
    } else {
        floatingCart.classList.remove('show');
        document.getElementById('cartOverlay').classList.remove('active');
    }
}

// Xóa hết
document.getElementById('clearCart').addEventListener('click', () => {
    if(confirm('Bạn có muốn xóa hết danh sách món ăn?')) {
        cart = [];
        updateCartUI();
    }
});

// Lưu ảnh thực đơn
document.getElementById('saveImg').addEventListener('click', function() {
    const area = document.getElementById('captureArea');
    const scale = Math.max(3, window.devicePixelRatio || 1);
    const rect = area.getBoundingClientRect();

    html2canvas(area, {
        scale,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height),
        onclone: (doc) => {
            const cloneArea = doc.getElementById('captureArea');
            if (cloneArea) {
                cloneArea.style.transform = 'none';
                cloneArea.style.animation = 'none';
                cloneArea.style.boxShadow = 'none';
            }
            const cloneHeaderRight = doc.querySelector('.header-right');
            if (cloneHeaderRight) cloneHeaderRight.style.display = 'none';
        }
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'thuc-don-tam-tinh.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});

// 2. Hàm thay đổi số lượng
window.changeQty = function(id, delta, event) {
    if (event) event.stopPropagation(); // Ngăn chặn nổi bọt sự kiện nếu có truyền event
    
    const item = cart.find(i => i.id == id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id != id);
        }
        updateCartUI();
    }
};

// 3. Lắng nghe sự kiện click nút "Đặt" (Event Delegation)
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('btn-add')) {
        const btn = e.target;
        const product = {
            id: btn.getAttribute('data-id'),
            name: btn.getAttribute('data-name'),
            price: parseInt(btn.getAttribute('data-price')),
            quantity: 1
        };

        // Kiểm tra trùng
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push(product);
        }

        updateCartUI();
    }
});

// 4. Đóng/Mở Modal (Sửa lại logic này)

// Mở Modal khi click vào nút trượt
document.getElementById('openCart').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('cartOverlay').classList.add('active');
});

// Đóng Modal khi click nút X
document.getElementById('closeCart').addEventListener('click', function(e) {
    // Chặn sự kiện lan truyền để không kích hoạt click của Overlay
    e.stopPropagation(); 
    document.getElementById('cartOverlay').classList.remove('active');
});

// ĐÓNG MODAL KHI CLICK RA NGOÀI (Logic chuẩn xác nhất)
document.getElementById('cartOverlay').addEventListener('click', function(e) {
    // Kiểm tra: Nếu phần tử bị click (e.target) chính là cartOverlay (vùng đen)
    // thì mới đóng. Nếu click trúng con của nó (modal, span, button...) thì target sẽ khác 'this'.
    if (e.target === this) {
        this.classList.remove('active');
    }
});

// Ngăn chặn nổi bọt từ Modal Area (Bảo hiểm thêm một lớp nữa)
document.getElementById('captureArea').addEventListener('click', function(e) {
    e.stopPropagation();
});

document.querySelector('.btn-submit-order').addEventListener('click', function() {
    if (cart.length === 0) {
        alert("Vui lòng chọn món trước khi đặt bàn!");
        return;
    }
    
    // 1. Đóng modal tạm tính
    document.getElementById('cartOverlay').classList.remove('active');
    
    // 2. Mở modal đặt bàn (từ Layout của bạn)
    const bookingOverlay = document.getElementById("bookingOverlay");
    if (bookingOverlay) {
        bookingOverlay.classList.add("active");
        // Lưu giỏ hàng vào biến window để layout.js có thể truy cập
        window.currentCart = cart; 
    } else {
        console.error("Không tìm thấy form đặt bàn!");
    }
});

window.currentCart = []; 
// Nếu đang ở trang menu thì gọi thêm hàm xóa sạch giao diện:
if (typeof cart !== 'undefined') {
    cart = [];
    updateCartUI();
}
