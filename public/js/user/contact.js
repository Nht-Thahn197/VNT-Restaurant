const scrollContainer = document.getElementById('menuScroll');
  const btnLeft = document.getElementById('scrollLeft');
  const btnRight = document.getElementById('scrollRight');

  const checkScroll = () => {
    const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;

    btnLeft.classList.toggle('hidden', scrollContainer.scrollLeft <= 0);
    btnRight.classList.toggle('hidden', scrollContainer.scrollLeft >= maxScrollLeft - 1);

    const leftBoundary = scrollContainer.scrollLeft + 40;
    const rightBoundary = scrollContainer.scrollLeft + scrollContainer.clientWidth - 40;
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

  document.addEventListener('DOMContentLoaded', function() {
    const tabComplaint = document.getElementById('tabComplaint');
    const tabMedia = document.getElementById('tabMedia');
    const formComplaint = document.getElementById('formComplaint');
    const formMedia = document.getElementById('formMedia');

    tabComplaint.addEventListener('click', function(e) {
        e.preventDefault();
        formComplaint.classList.add('active');
        formMedia.classList.remove('active');
        tabComplaint.classList.add('active');
        tabMedia.classList.remove('active');
    });

    tabMedia.addEventListener('click', function(e) {
        e.preventDefault();
        formMedia.classList.add('active');
        formComplaint.classList.remove('active');
        tabMedia.classList.add('active');
        tabComplaint.classList.remove('active');
    });
});

document.addEventListener('DOMContentLoaded', function() {
  const toast = document.getElementById('toast-success'); 
  if (toast) {
    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 3000);
  }
});