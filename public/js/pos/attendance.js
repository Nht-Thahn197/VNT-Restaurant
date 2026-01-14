(() => {
  const page = document.querySelector('.attendance-page');
  if (!page) return;

  const dataEndpoint = page.dataset.endpoint || '';
  const updateEndpoint = page.dataset.updateEndpoint || '';
  const clockEndpoint = page.dataset.clockEndpoint || '';
  const canManage = page.dataset.canManage === '1';
  const currentStaffId = Number(page.dataset.staffId || 0);
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
  const headerEl = document.getElementById('attendanceHeader');
  const bodyEl = document.getElementById('attendanceBody');
  const searchInput = document.getElementById('attendanceSearch');
  const weekLabel = document.getElementById('weekLabel');
  const attendanceModal = document.getElementById('attendanceModal');
  const modalStaffName = document.getElementById('modalStaffName');
  const modalStaffCode = document.getElementById('modalStaffCode');
  const modalStatusPill = document.getElementById('modalStatusPill');
  const modalWorkDate = document.getElementById('modalWorkDate');
  const modalShiftSelect = document.getElementById('modalShiftSelect');
  const modalShiftWrap = document.getElementById('modalShiftSelectWrap');
  const modalShiftMenu = document.getElementById('modalShiftMenu');
  const modalShiftText = document.getElementById('modalShiftText');
  const modalNote = document.getElementById('modalNote');
  const modalCheckIn = document.getElementById('modalCheckIn');
  const modalCheckOut = document.getElementById('modalCheckOut');
  const modalCheckInToggle = document.getElementById('modalCheckInToggle');
  const modalCheckOutToggle = document.getElementById('modalCheckOutToggle');
  const modalCheckInWrap = document.getElementById('modalCheckInWrap');
  const modalCheckOutWrap = document.getElementById('modalCheckOutWrap');
  const btnClock = document.getElementById('btnClock');
  const btnSave = document.getElementById('btnSaveAttendance');
  const btnCancelShift = document.getElementById('btnCancelShift');

  const dayNames = ['Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy', 'Chủ nhật'];

  let currentWeekStart = getWeekStart(new Date());
  let shifts = [];
  let schedules = [];
  let activeCard = null;

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function formatDate(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  function formatIsoDate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  function updateWeekLabel() {
    const weekNo = getWeekNumber(currentWeekStart);
    const month = String(currentWeekStart.getMonth() + 1).padStart(2, '0');
    const year = currentWeekStart.getFullYear();
    weekLabel.textContent = `Tuần ${weekNo} - Th. ${month}/${year}`;
  }

  function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate()
      && date.getMonth() === today.getMonth()
      && date.getFullYear() === today.getFullYear();
  }

  function renderHeader() {
    headerEl.innerHTML = '';
    const firstCell = document.createElement('div');
    firstCell.className = 'attendance-cell';
    firstCell.textContent = 'Ca làm việc';
    headerEl.appendChild(firstCell);

    for (let i = 0; i < 7; i += 1) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      const cell = document.createElement('div');
      cell.className = 'attendance-cell';
      if (isToday(date)) {
        cell.innerHTML = `<span class="day-pill">${dayNames[i]} <span class="dot">${date.getDate()}</span></span>`;
      } else {
        cell.textContent = `${dayNames[i]} ${date.getDate()}`;
      }
      headerEl.appendChild(cell);
    }
  }

  function setTimeVisibility(wrapper, isVisible) {
    if (!wrapper) return;
    wrapper.classList.toggle('is-visible', Boolean(isVisible));
  }

  function formatTime(value) {
    if (!value) return '';
    const parts = String(value).split(' ');
    const timePart = parts.length > 1 ? parts[1] : parts[0];
    return timePart.slice(0, 5);
  }

  function parseLocalDate(value) {
    if (!value) return null;
    const parts = value.split('-').map(Number);
    if (parts.length < 3) return null;
    const [year, month, day] = parts;
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }

  function parseLocalDateTime(workDate, timeValue) {
    const baseDate = parseLocalDate(workDate);
    if (!baseDate) return null;
    if (!timeValue) {
      return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0, 0, 0);
    }
    const timeParts = timeValue.split(':').map(Number);
    const hours = timeParts[0] || 0;
    const minutes = timeParts[1] || 0;
    const seconds = timeParts[2] || 0;
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hours, minutes, seconds);
  }

  function formatDuration(minutes) {
    const total = Math.max(0, Math.floor(minutes));
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    if (hours && mins) {
      return `${hours}h ${mins}p`;
    }
    if (hours) {
      return `${hours}h`;
    }
    return `${mins}p`;
  }

  function isTooEarlyForStaff(card) {
    if (!card) return false;
    const startTime = card.dataset.shiftStart ? card.dataset.shiftStart.slice(0, 5) : '00:00';
    const shiftStartAt = parseLocalDateTime(card.dataset.workDate, startTime);
    if (!shiftStartAt) return false;
    const earlyWindow = new Date(shiftStartAt.getTime() - 30 * 60 * 1000);
    return new Date() < earlyWindow;
  }

  function resolveStatus(item, workDate, shiftStart, shiftEnd) {
    const attendanceType = item.attendance_type || '';
    const now = new Date();
    const startTime = shiftStart ? shiftStart.slice(0, 5) : '00:00';
    const endTime = shiftEnd ? shiftEnd.slice(0, 5) : '00:00';
    const shiftStartAt = parseLocalDateTime(workDate, startTime);
    const shiftEndAt = parseLocalDateTime(workDate, endTime);
    const workDay = parseLocalDate(workDate);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const earlyWindow = shiftStartAt ? new Date(shiftStartAt.getTime() - 30 * 60 * 1000) : null;

    if (workDay && workDay > todayStart) {
      return { label: 'Chưa đến ca', className: 'status-future' };
    }
    if (earlyWindow && now < earlyWindow && !item.check_in && !item.check_out) {
      return { label: 'Chưa đến ca', className: 'status-future' };
    }
    if (attendanceType === 'leave_paid') {
      return { label: 'Nghỉ có phép', className: 'status-missing' };
    }
    if (attendanceType === 'leave_unpaid') {
      return { label: 'Nghỉ không phép', className: 'status-missing' };
    }
    if (attendanceType === 'off') {
      return { label: 'Nghỉ làm', className: 'status-missing' };
    }

    if (item.check_in && !item.check_out) {
      if (shiftEndAt && now > shiftEndAt) {
        return { label: 'Chấm công thiếu', className: 'status-missing' };
      }
      return { label: 'Chưa chấm ra', className: 'status-open' };
    }

    if (!item.check_in && !item.check_out) {
      if (earlyWindow && now < earlyWindow) {
        return { label: 'Chưa đến ca', className: 'status-future' };
      }
      return { label: 'Chưa chấm công', className: 'status-none' };
    }

    if (item.check_in && item.check_out && shiftStartAt && shiftEndAt) {
      const checkInAt = parseLocalDateTime(workDate, formatTime(item.check_in));
      const checkOutAt = parseLocalDateTime(workDate, formatTime(item.check_out));
      const lateMinutes = checkInAt ? Math.max(0, Math.round((checkInAt - shiftStartAt) / 60000)) : 0;
      const earlyMinutes = checkOutAt ? Math.max(0, Math.round((shiftEndAt - checkOutAt) / 60000)) : 0;
      if (lateMinutes > 0 || earlyMinutes > 0) {
        const parts = [];
        if (lateMinutes > 0) parts.push(`Đi muộn ${formatDuration(lateMinutes)}`);
        if (earlyMinutes > 0) parts.push(`Về sớm ${formatDuration(earlyMinutes)}`);
        return { label: parts.join(' và '), className: 'status-late' };
      }
    }

    return { label: 'Đúng giờ', className: 'status-ok' };
  }

  function renderBody() {
    bodyEl.innerHTML = '';
    const keyword = searchInput.value.trim().toLowerCase();
    const scheduleMap = {};

    schedules.forEach((item) => {
      if (keyword) {
        const text = `${item.staff_name} ${item.staff_code}`.toLowerCase();
        if (!text.includes(keyword)) return;
      }
      const key = `${item.shift_id}_${item.work_date}`;
      if (!scheduleMap[key]) {
        scheduleMap[key] = [];
      }
      scheduleMap[key].push(item);
    });

    shifts.forEach((shift) => {
      const row = document.createElement('div');
      row.className = 'attendance-row';

      const infoCell = document.createElement('div');
      infoCell.className = 'attendance-cell';
      infoCell.innerHTML = `
        <div class="shift-title">${shift.name}</div>
        <div class="shift-time">${shift.start_time} - ${shift.end_time}</div>
      `;
      row.appendChild(infoCell);

      for (let i = 0; i < 7; i += 1) {
        const date = new Date(currentWeekStart);
        date.setDate(currentWeekStart.getDate() + i);
        const isoDate = formatIsoDate(date);
        const cell = document.createElement('div');
        cell.className = 'attendance-cell';
        const items = scheduleMap[`${shift.id}_${isoDate}`] || [];

        items.forEach((item) => {
          const status = resolveStatus(item, item.work_date, shift.start_time, shift.end_time);
          const timeLabel = item.check_in || item.check_out
            ? `${formatTime(item.check_in)} - ${formatTime(item.check_out)}`.trim()
            : '-- --';
          const card = document.createElement('div');
          card.className = `attendance-card ${status.className}`;
          card.innerHTML = `
            <strong>${item.staff_name}</strong>
            <div class="attendance-time">${timeLabel}</div>
            <div class="attendance-status">${status.label}</div>
          `;
          card.dataset.staffId = item.staff_id;
          card.dataset.staffName = item.staff_name;
          card.dataset.staffCode = item.staff_code;
          card.dataset.shiftId = item.shift_id;
          card.dataset.shiftName = item.shift_name;
          card.dataset.shiftStart = shift.start_time;
          card.dataset.shiftEnd = shift.end_time;
          card.dataset.workDate = item.work_date;
          card.dataset.checkIn = item.check_in || '';
          card.dataset.checkOut = item.check_out || '';
          card.dataset.status = item.attendance_status || '';
          card.dataset.attendanceType = item.attendance_type || '';
          card.dataset.note = item.note || '';
          cell.appendChild(card);
        });

        row.appendChild(cell);
      }

      bodyEl.appendChild(row);
    });
  }

  async function fetchData() {
    const params = new URLSearchParams({
      weekStart: formatIsoDate(currentWeekStart)
    });
    const res = await fetch(`${dataEndpoint}?${params.toString()}`);
    const data = await res.json();
    if (data.success) {
      shifts = data.shifts || [];
      schedules = data.schedules || [];
    }
  }

  async function renderAll() {
    await fetchData();
    renderHeader();
    renderBody();
    updateWeekLabel();
  }

  function openModal() {
    if (attendanceModal) attendanceModal.classList.add('active');
  }

  function closeModal() {
    if (attendanceModal) attendanceModal.classList.remove('active');
    closeShiftMenu();
    activeCard = null;
  }

  function setModalTab(target) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${target}"]`)?.classList.add('active');
    document.querySelector(`.tab-content[data-content="${target}"]`)?.classList.add('active');
  }

  function syncClockButton() {
    if (!btnClock || !activeCard) return;
    const hasCheckIn = Boolean(activeCard.dataset.checkIn);
    const hasCheckOut = Boolean(activeCard.dataset.checkOut);
    btnClock.textContent = hasCheckIn && !hasCheckOut ? 'Thoát ca' : 'Chấm công';
  }

  function buildShiftLabel(shift) {
    return `${shift.name} (${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)})`;
  }

  function setShiftValue(shiftId) {
    if (!modalShiftSelect || !modalShiftText) return;
    const selectedShift = shifts.find(shift => Number(shift.id) === Number(shiftId));
    if (!selectedShift) {
      modalShiftText.textContent = '--';
      return;
    }
    modalShiftSelect.value = selectedShift.id;
    modalShiftText.textContent = buildShiftLabel(selectedShift);
    if (modalShiftMenu) {
      modalShiftMenu.querySelectorAll('.custom-select-option').forEach((option) => {
        option.classList.toggle('selected', Number(option.dataset.value) === Number(selectedShift.id));
      });
    }
  }

  function closeShiftMenu() {
    modalShiftWrap?.classList.remove('open');
  }

  function fillShiftSelect(shiftId) {
    if (!modalShiftSelect) return;
    modalShiftSelect.innerHTML = '';
    if (modalShiftMenu) modalShiftMenu.innerHTML = '';

    shifts.forEach((shift) => {
      const option = document.createElement('option');
      option.value = shift.id;
      option.textContent = buildShiftLabel(shift);
      modalShiftSelect.appendChild(option);

      if (modalShiftMenu) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'custom-select-option';
        item.dataset.value = String(shift.id);
        item.textContent = buildShiftLabel(shift);
        item.addEventListener('click', () => {
          setShiftValue(shift.id);
          closeShiftMenu();
        });
        modalShiftMenu.appendChild(item);
      }
    });

    const fallbackId = shiftId || shifts[0]?.id;
    setShiftValue(fallbackId);
  }

  function setModalData(card) {
    modalStaffName.textContent = card.dataset.staffName;
    modalStaffCode.textContent = ` | ${card.dataset.staffCode}`;
    modalWorkDate.textContent = `${card.dataset.workDate}`;
    modalNote.value = card.dataset.note || '';
    modalCheckIn.value = formatTime(card.dataset.checkIn);
    modalCheckOut.value = formatTime(card.dataset.checkOut);
    modalCheckInToggle.checked = Boolean(card.dataset.checkIn);
    modalCheckOutToggle.checked = Boolean(card.dataset.checkOut);
    const attendanceType = card.dataset.attendanceType || 'working';
    const statusInput = document.querySelector(`input[name="modalStatus"][value="${attendanceType}"]`);
    if (statusInput) statusInput.checked = true;
    if (attendanceType !== 'working') {
      modalCheckInToggle.checked = false;
      modalCheckOutToggle.checked = false;
      modalCheckIn.value = '';
      modalCheckOut.value = '';
    }
    setTimeVisibility(modalCheckInWrap, modalCheckInToggle.checked);
    setTimeVisibility(modalCheckOutWrap, modalCheckOutToggle.checked);

    fillShiftSelect(card.dataset.shiftId);

    const status = resolveStatus({
      attendance_status: card.dataset.status,
      attendance_type: attendanceType,
      check_in: card.dataset.checkIn,
      check_out: card.dataset.checkOut,
      note: card.dataset.note
    }, card.dataset.workDate, card.dataset.shiftStart, card.dataset.shiftEnd);
    modalStatusPill.textContent = status.label;

    const statusInputs = document.querySelectorAll('input[name="modalStatus"]');
    statusInputs.forEach(input => { input.disabled = !canManage; });
    const hasAttendanceTime = Boolean(card.dataset.checkIn || card.dataset.checkOut);
    const canEditShift = canManage && !hasAttendanceTime;
    const shiftLocked = !canEditShift;
    modalShiftSelect.disabled = shiftLocked;
    modalShiftWrap?.classList.toggle('disabled', shiftLocked);
    if (shiftLocked) closeShiftMenu();
    modalCheckIn.disabled = !canManage;
    modalCheckOut.disabled = !canManage;
    modalCheckInToggle.disabled = !canManage;
    modalCheckOutToggle.disabled = !canManage;
    modalNote.disabled = !canManage;
    if (btnClock) btnClock.style.display = canManage ? 'none' : 'inline-flex';
    if (btnSave) btnSave.style.display = canManage ? 'inline-flex' : 'none';
    if (btnCancelShift) btnCancelShift.disabled = !canEditShift;

  }

  async function saveAttendance(options = {}) {
    if (!activeCard) return;

    const mode = options.mode || 'default';
    const selectedAttendanceType = document.querySelector('input[name="modalStatus"]:checked')?.value || 'working';
    let attendanceType = selectedAttendanceType;
    let checkInValue = modalCheckInToggle.checked ? modalCheckIn.value : null;
    let checkOutValue = modalCheckOutToggle.checked ? modalCheckOut.value : null;
    let statusValue = 'pending';

    if (mode === 'cancel') {
      attendanceType = 'off';
      statusValue = 'completed';
      checkInValue = null;
      checkOutValue = null;
    } else if (mode === 'change_shift') {
      attendanceType = 'working';
      statusValue = 'pending';
      checkInValue = null;
      checkOutValue = null;
    } else if (attendanceType !== 'working') {
      statusValue = 'completed';
      checkInValue = null;
      checkOutValue = null;
    } else if (checkInValue && checkOutValue) {
      statusValue = 'completed';
    }

    const targetShiftId = mode === 'cancel'
      ? Number(activeCard.dataset.shiftId)
      : Number(modalShiftSelect.value);

    const payload = {
      staff_id: Number(activeCard.dataset.staffId),
      work_date: activeCard.dataset.workDate,
      shift_id: Number(activeCard.dataset.shiftId),
      new_shift_id: targetShiftId,
      attendance_type: attendanceType,
      status: statusValue,
      note: modalNote.value.trim(),
      check_in: checkInValue,
      check_out: checkOutValue
    };

    const res = await fetch(updateEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) {
      console.error('Update attendance failed:', data);
      return;
    }
    closeModal();
    renderAll();
  }

  async function clockSelf() {
    if (!activeCard) return;
    const payload = {
      work_date: activeCard.dataset.workDate,
      shift_id: Number(activeCard.dataset.shiftId)
    };
    const res = await fetch(clockEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) {
      console.error('Clock failed:', data);
      return;
    }
    closeModal();
    renderAll();
  }

  document.getElementById('prevWeek')?.addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    renderAll();
  });

  document.getElementById('nextWeek')?.addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    renderAll();
  });

  searchInput?.addEventListener('input', () => {
    renderBody();
  });

  bodyEl.addEventListener('click', (event) => {
    const card = event.target.closest('.attendance-card');
    if (!card) return;
    activeCard = card;
    if (!canManage && Number(card.dataset.staffId) !== currentStaffId) {
      return;
    }
    if (!canManage && isTooEarlyForStaff(card)) {
      return;
    }
    setModalData(card);
    syncClockButton();
    setModalTab('attendance');
    openModal();
  });

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setModalTab(btn.dataset.tab);
    });
  });

  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', closeModal);
  });

  modalCheckInToggle?.addEventListener('change', () => {
    if (modalCheckInToggle.checked && !modalCheckIn.value) {
      modalCheckIn.value = activeCard?.dataset.shiftStart?.slice(0, 5) || '';
    }
    if (!modalCheckInToggle.checked) {
      modalCheckIn.value = '';
    }
    setTimeVisibility(modalCheckInWrap, modalCheckInToggle.checked);
  });

  modalCheckOutToggle?.addEventListener('change', () => {
    if (modalCheckOutToggle.checked && !modalCheckOut.value) {
      modalCheckOut.value = activeCard?.dataset.shiftEnd?.slice(0, 5) || '';
    }
    if (!modalCheckOutToggle.checked) {
      modalCheckOut.value = '';
    }
    setTimeVisibility(modalCheckOutWrap, modalCheckOutToggle.checked);
  });

  btnSave?.addEventListener('click', () => {
    if (!canManage) return;
    saveAttendance();
  });

  btnCancelShift?.addEventListener('click', () => {
    if (!canManage || btnCancelShift.disabled) return;
    saveAttendance({ mode: 'cancel' });
  });

  btnClock?.addEventListener('click', () => {
    if (canManage) return;
    clockSelf();
  });

  modalShiftWrap?.querySelector('.custom-select-trigger')?.addEventListener('click', () => {
    if (modalShiftWrap.classList.contains('disabled')) return;
    modalShiftWrap.classList.toggle('open');
  });

  document.addEventListener('click', (event) => {
    if (!modalShiftWrap) return;
    if (modalShiftWrap.classList.contains('open') && !modalShiftWrap.contains(event.target)) {
      closeShiftMenu();
    }
  });
  if (!canManage) {
    if (btnCancelShift) btnCancelShift.style.display = 'none';
  }

  renderAll();
})();
