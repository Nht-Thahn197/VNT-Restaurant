/* LOADER START */
let progress = 0;
const progressBar = document.querySelector('.progress');
const percentText = document.querySelector('.percent');
const preloader = document.getElementById('preloader');

const speed = 20;
  const loading = setInterval(() => {
    progress += Math.floor(Math.random() * 5) + 2;
    if (progress > 100) progress = 100;
    progressBar.style.width = progress + '%';
    percentText.textContent = progress + '%';

    if (progress === 100) {
      clearInterval(loading);
      setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => {
          preloader.style.display = 'none';
          document.body.classList.add('loaded');
        }, 500);
      }, 300);
    }
  }, speed);
  /* LOADER END */