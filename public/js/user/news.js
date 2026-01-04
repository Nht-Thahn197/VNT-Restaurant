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

  