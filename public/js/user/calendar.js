/* calendar-modal.js */
(function(){
  // Helpers
  const pad = n => String(n).padStart(2,'0');
  const monthNames = [
    "Tháng 01","Tháng 02","Tháng 03","Tháng 04","Tháng 05","Tháng 06",
    "Tháng 07","Tháng 08","Tháng 09","Tháng 10","Tháng 11","Tháng 12"
  ];
  const daysShort = ["CN","T2","T3","T4","T5","T6","T7"];

  // DOM
  const openBtn = document.getElementById('openCalendarBtn');
  const dateText = document.getElementById('dateText');
  const hiddenInput = document.getElementById('bookingDateHidden');

  const modal = document.getElementById('calendarModal');
  const backdrop = document.getElementById('calendarBackdrop');
  const box = modal.querySelector('.calendar-box');
  const title = document.getElementById('calendarTitle');
  const prevBtn = document.getElementById('calPrev');
  const nextBtn = document.getElementById('calNext');
  const bodyEl = document.getElementById('calendarBody');
  const todayBtn = document.getElementById('calToday');
  const closeBtn = document.getElementById('calClose');

  // Today ref (00:00)
  const today = new Date();
  today.setHours(0,0,0,0);

  // view month/year
  let viewMonth = today.getMonth();
  let viewYear = today.getFullYear();

  // open modal
  function openModal(){
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    openBtn.setAttribute('aria-expanded','true');
    renderCalendar(viewYear, viewMonth);
  }
  // close modal
  function closeModal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    openBtn.setAttribute('aria-expanded','false');
  }

  openBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    openModal();
  });
  backdrop.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);

  // ESC closes
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeModal();
  });

  // render calendar (table)
  function renderCalendar(year, month){
    // set title
    title.textContent = `${monthNames[month]} ${year}`;

    // disable prev if trying to go before current month
    const isCurrent = (year === today.getFullYear() && month === today.getMonth());
    prevBtn.disabled = isCurrent;

    // build grid: header row has days already in HTML, we fill tbody
    bodyEl.innerHTML = '';

    // first day index of month (0 = Sun)
    const firstOfMonth = new Date(year, month, 1).getDay(); // 0..6
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // number of rows needed (max 6)
    let dateNum = 1;
    const weeks = 6;

    for(let w=0; w<weeks; w++){
      const tr = document.createElement('tr');
      for(let d=0; d<7; d++){
        const td = document.createElement('td');

        // compute whether to show a number
        const cellIndex = w*7 + d;
        const showNumber = (cellIndex >= firstOfMonth) && (dateNum <= daysInMonth);

        if(showNumber){
          const cellDate = new Date(year, month, dateNum);
          td.textContent = dateNum;
          td.classList.add('calendar-day');
          td.setAttribute('data-date', `${pad(dateNum)}/${pad(month+1)}/${year}`);

          // disable if before today
          if(cellDate < today){
            td.classList.add('disabled');
          } else {
            // clickable
            td.addEventListener('click', ()=> {
              // mark selected
              bodyEl.querySelectorAll('.calendar-day').forEach(x => x.classList.remove('selected'));
              td.classList.add('selected');

              // value in format dd/mm/yyyy goes to hidden input
              const val = td.getAttribute('data-date');
              hiddenInput.value = val;

              // visible text on trigger: "03 Tháng 11"
              const parts = val.split('/');
              const dd = parts[0];
              const mm = parts[1];
              dateText.textContent = `${dd} ${"Tháng"} ${Number(mm)}`;

              // close modal with tiny delay for UX
              setTimeout(closeModal, 120);
            });

            // hover effect: handled by CSS (border change)
          }
          dateNum++;
        } else {
          td.textContent = '';
        }

        tr.appendChild(td);
      }
      bodyEl.appendChild(tr);
    }
  }

  // prev/next controls
  prevBtn.addEventListener('click', ()=> {
    let candYear = viewYear, candMonth = viewMonth - 1;
    if(candMonth < 0){ candMonth = 11; candYear--; }
    // prevent going to a month earlier than current month
    const minYear = today.getFullYear(), minMonth = today.getMonth();
    if(candYear < minYear || (candYear === minYear && candMonth < minMonth)) return;
    viewYear = candYear; viewMonth = candMonth;
    renderCalendar(viewYear, viewMonth);
  });

  nextBtn.addEventListener('click', ()=> {
    viewMonth++;
    if(viewMonth > 11){ viewMonth = 0; viewYear++; }
    renderCalendar(viewYear, viewMonth);
  });

  // today button: set value to today and close
  todayBtn.addEventListener('click', ()=>{
    const dd = pad(today.getDate()), mm = pad(today.getMonth()+1), yy = today.getFullYear();
    const val = `${dd}/${mm}/${yy}`;
    hiddenInput.value = val;
    dateText.textContent = `${dd} Tháng ${Number(mm)}`;
    closeModal();
  });

  // init: if you want default to show today's text uncomment below:
  // const dd0 = pad(today.getDate()); const mm0 = pad(today.getMonth()+1);
  // dateText.textContent = `${dd0} Tháng ${Number(mm0)}`;
  // hiddenInput.value = `${dd0}/${mm0}/${today.getFullYear()}`;

  // initial render (not shown until open)
  renderCalendar(viewYear, viewMonth);

})();
