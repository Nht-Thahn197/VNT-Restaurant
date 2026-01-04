const slides = document.querySelectorAll('.slide');
const next = document.querySelector('.next');
const prev = document.querySelector('.prev');
let index = 0;


// Hàm hiển thị slide
function showSlide(i) {
  index = i;
  slides.forEach((s, idx) => s.style.transform = `translateX(-${index * 100}%)`);
}

// Nút điều hướng
next.addEventListener('click', () => {
  index = (index + 1) % slides.length;
  showSlide(index);
});
prev.addEventListener('click', () => {
  index = (index - 1 + slides.length) % slides.length;
  showSlide(index);
});

// Tự động chuyển slide
setInterval(() => {
  index = (index + 1) % slides.length;
  showSlide(index);
}, 5000);






