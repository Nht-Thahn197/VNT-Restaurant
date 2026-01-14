(() => {
  let shifts = [];
  let staff = [];
  let schedules = [];

  const dayNames = ['Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy', 'Chủ nhật'];
  const page = document.querySelector('.schedule-page');
  const headerEl = document.getElementById('scheduleHeader');
  const bodyEl = document.getElementById('scheduleBody');
  const staffSearch = document.getElementById('staffSearch');
  const weekLabel = document.getElementById('weekLabel');
  const btnCurrentWeek = document.getElementById('btnCurrentWeek');
  const dataEndpoint = page?.dataset.endpoint || '';
  const storeEndpoint = page?.dataset.storeEndpoint || '';
  const deleteEndpoint = page?.dataset.deleteEndpoint || '';
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
  const saveShiftBtn = document.getElementById('saveShiftSchedule');
  const saveStaffBtn = document.getElementById('saveStaffSchedule');
  const deleteMeta = document.getElementById('deleteMeta');
  const confirmDeleteBtn = document.getElementById('confirmDeleteSchedule');

  let currentWeekStart = getWeekStart(new Date());
  let viewMode = 'shift';
  let activeCell = null;
  let pendingDelete = null;

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

  function formatDayLabel(date, index) {
    return `${dayNames[index]}, ${formatDate(date)}`;
  }

  function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate()
      && date.getMonth() === today.getMonth()
      && date.getFullYear() === today.getFullYear();
  }

  function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return weekNo;
  }

  function updateWeekLabel() {
    const weekNo = getWeekNumber(currentWeekStart);
    const month = String(currentWeekStart.getMonth() + 1).padStart(2, '0');
    const year = currentWeekStart.getFullYear();
    weekLabel.textContent = `Tuần ${weekNo} - Th. ${month}/${year}`;

    const todayStart = getWeekStart(new Date());
    btnCurrentWeek.disabled = todayStart.getTime() === currentWeekStart.getTime();
  }

  function renderHeader() {
    headerEl.innerHTML = '';
    const firstCell = document.createElement('div');
    firstCell.className = 'schedule-cell';
    firstCell.textContent = viewMode === 'shift' ? 'Ca làm việc' : 'Nhân viên';
    headerEl.appendChild(firstCell);

    for (let i = 0; i < 7; i += 1) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      const cell = document.createElement('div');
      cell.className = 'schedule-cell';
      if (isToday(date)) {
        cell.innerHTML = `<span class="day-pill">${dayNames[i]} <span class="dot">${date.getDate()}</span></span>`;
      } else {
        cell.textContent = `${dayNames[i]} ${date.getDate()}`;
      }
      headerEl.appendChild(cell);
    }

    if (viewMode === 'staff') {
      const salaryCell = document.createElement('div');
      salaryCell.className = 'schedule-cell';
      salaryCell.textContent = 'Lương dự kiến';
      headerEl.appendChild(salaryCell);
    }
  }

  function buildScheduleMaps() {
    const scheduleByShift = {};
    const scheduleByStaff = {};
    const staffStats = {};

    schedules.forEach((item) => {
      if (!scheduleByShift[item.shift_id]) {
        scheduleByShift[item.shift_id] = {};
      }
      if (!scheduleByStaff[item.staff_id]) {
        scheduleByStaff[item.staff_id] = {};
      }
      if (!staffStats[item.staff_id]) {
        staffStats[item.staff_id] = {
          minutes: 0,
          shiftCount: 0,
          dates: new Set()
        };
      }

      const dayKey = item.work_date;
      scheduleByShift[item.shift_id][dayKey] = scheduleByShift[item.shift_id][dayKey] || [];
      scheduleByStaff[item.staff_id][dayKey] = scheduleByStaff[item.staff_id][dayKey] || [];

      scheduleByShift[item.shift_id][dayKey].push(item.staff_id);
      scheduleByStaff[item.staff_id][dayKey].push(item.shift_id);

      const shift = shifts.find(entry => entry.id === item.shift_id);
      if (shift) {
        const start = shift.start_time || shift.start || '00:00';
        const end = shift.end_time || shift.end || '00:00';
        const breakMinutes = Number(shift.break_minutes || 0);
        const totalMinutes = calcShiftMinutes(start, end) - breakMinutes;
        staffStats[item.staff_id].minutes += Math.max(totalMinutes, 0);
      }
      staffStats[item.staff_id].shiftCount += 1;
      staffStats[item.staff_id].dates.add(dayKey);
    });

    return { scheduleByShift, scheduleByStaff, staffStats };
  }

  function getShiftTime(shift) {
    const start = shift.start_time || shift.start || '';
    const end = shift.end_time || shift.end || '';
    return { start, end };
  }

  function renderBody() {
    bodyEl.innerHTML = '';
    const searchValue = staffSearch.value.trim().toLowerCase();
    const { scheduleByShift, scheduleByStaff, staffStats } = buildScheduleMaps();

    if (viewMode === 'shift') {
      shifts.forEach((shift) => {
        const time = getShiftTime(shift);
        const row = document.createElement('div');
        row.className = 'schedule-row';

        const infoCell = document.createElement('div');
        infoCell.className = 'schedule-cell';
        infoCell.innerHTML = `<div class="row-title">${shift.name}</div><div class="row-subtitle">${time.start} - ${time.end}</div>`;
        row.appendChild(infoCell);

        for (let i = 0; i < 7; i += 1) {
          const cell = document.createElement('div');
          cell.className = 'schedule-cell';
          const date = new Date(currentWeekStart);
          date.setDate(currentWeekStart.getDate() + i);
          const isoDate = formatIsoDate(date);
          cell.dataset.shift = `${shift.name} (${time.start} - ${time.end})`;
          cell.dataset.date = formatDayLabel(date, i);
          cell.dataset.dateValue = isoDate;
          cell.dataset.shiftId = shift.id;
          const staffIds = (scheduleByShift[shift.id] && scheduleByShift[shift.id][isoDate]) || [];
          const chips = staffIds.map((staffId) => {
            const found = staff.find(item => item.id === staffId);
            if (!found) return '';
            return `<span class="schedule-chip" data-staff-id="${found.id}" data-shift-id="${shift.id}" data-date="${isoDate}">${found.name}</span>`;
          }).join('');
          cell.innerHTML = `
            <div class="cell-content">${chips || ''}</div>
            <button class="cell-add"><i class="fas fa-plus"></i> Thêm nhân viên</button>
          `;
          row.appendChild(cell);
        }
        bodyEl.appendChild(row);
      });
    } else {
      const filteredStaff = staff.filter(item => {
        if (!searchValue) return true;
        return item.name.toLowerCase().includes(searchValue) || item.code.toLowerCase().includes(searchValue);
      });

      filteredStaff.forEach((person) => {
        const row = document.createElement('div');
        row.className = 'schedule-row';

        const infoCell = document.createElement('div');
        infoCell.className = 'schedule-cell';
        infoCell.innerHTML = `<div class="row-title">${person.name}</div><div class="row-subtitle">${person.code}</div>`;
        row.appendChild(infoCell);

        for (let i = 0; i < 7; i += 1) {
          const cell = document.createElement('div');
          cell.className = 'schedule-cell';
          const date = new Date(currentWeekStart);
          date.setDate(currentWeekStart.getDate() + i);
          const isoDate = formatIsoDate(date);
          cell.dataset.staff = person.name;
          cell.dataset.date = formatDayLabel(date, i);
          cell.dataset.dateValue = isoDate;
          cell.dataset.staffId = person.id;
          const shiftIds = (scheduleByStaff[person.id] && scheduleByStaff[person.id][isoDate]) || [];
          const chips = shiftIds.map((shiftId) => {
            const found = shifts.find(item => item.id === shiftId);
            if (!found) return '';
            return `<span class="schedule-chip" data-staff-id="${person.id}" data-shift-id="${shiftId}" data-date="${isoDate}">${found.name}</span>`;
          }).join('');
          cell.innerHTML = `
            <div class="cell-content">${chips || ''}</div>
            <button class="cell-add"><i class="fas fa-plus"></i> Thêm lịch</button>
          `;
          row.appendChild(cell);
        }

        const salaryCell = document.createElement('div');
        salaryCell.className = 'schedule-cell';
        const stats = staffStats[person.id];
        const salaryType = person.salary_type || '';
        const salaryRate = Number(person.salary_rate || 0);

        if (!salaryType) {
          salaryCell.innerHTML = '<div class="row-subtitle">Chưa thiết lập lương</div>';
        } else if (!stats || stats.shiftCount === 0) {
          salaryCell.innerHTML = '';
        } else {
          const salaryAmount = calcSalaryAmount(salaryType, salaryRate, stats);
          salaryCell.innerHTML = `<div class="row-title">${formatCurrency(salaryAmount)}</div>`;
        }
        row.appendChild(salaryCell);

        bodyEl.appendChild(row);
      });
    }
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }

  function bindCellActions() {
    bodyEl.querySelectorAll('.schedule-cell').forEach((cell) => {
      const addBtn = cell.querySelector('.cell-add');
      if (!addBtn) return;
      addBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        activeCell = cell;
        if (viewMode === 'shift') {
          const shiftInfo = document.getElementById('modalShiftInfo');
          const shiftDate = document.getElementById('modalShiftDate');
          if (shiftInfo) shiftInfo.textContent = cell.dataset.shift;
          if (shiftDate) shiftDate.textContent = cell.dataset.date;
          renderStaffPicker('shiftStaffList');
          openModal('shiftModal');
        } else {
          const staffInfo = document.getElementById('modalStaffInfo');
          const staffDate = document.getElementById('modalStaffDate');
          if (staffInfo) staffInfo.textContent = cell.dataset.staff;
          if (staffDate) staffDate.textContent = cell.dataset.date;
          renderShiftPicker('staffShiftList');
          openModal('staffModal');
        }
      });
    });
  }

  function bindChipActions() {
    bodyEl.querySelectorAll('.schedule-chip').forEach((chip) => {
      chip.addEventListener('click', (event) => {
        event.stopPropagation();
        const staffId = Number(chip.dataset.staffId);
        const shiftId = Number(chip.dataset.shiftId);
        const dateValue = chip.dataset.date;
        if (!staffId || !shiftId || !dateValue) return;

        const staffName = staff.find(item => item.id === staffId)?.name || '';
        const shiftName = shifts.find(item => item.id === shiftId)?.name || '';

        pendingDelete = { staffId, shiftId, dateValue };
        if (deleteMeta) {
          deleteMeta.innerHTML = `
            <div><strong>Nhân viên:</strong> ${staffName}</div>
            <div><strong>Ca:</strong> ${shiftName}</div>
            <div><strong>Ngày:</strong> ${dateValue}</div>
          `;
        }
        openModal('deleteModal');
      });
    });
  }

  function renderStaffPicker(targetId) {
    const container = document.getElementById(targetId);
    if (!container) return;
    container.innerHTML = '';
    staff.forEach((person) => {
      const item = document.createElement('label');
      item.className = 'picker-item';
      item.innerHTML = `
        <input type="checkbox" data-id="${person.id}">
        <div>
          <strong>${person.name}</strong>
          <span>${person.code}</span>
        </div>
      `;
      container.appendChild(item);
    });
  }

  function renderShiftPicker(targetId) {
    const container = document.getElementById(targetId);
    if (!container) return;
    container.innerHTML = '';
    shifts.forEach((shift) => {
      const time = getShiftTime(shift);
      const item = document.createElement('label');
      item.className = 'picker-item';
      item.innerHTML = `
        <input type="checkbox" data-id="${shift.id}">
        <div>
          <strong>${shift.name}</strong>
          <span>${time.start} - ${time.end}</span>
        </div>
      `;
      container.appendChild(item);
    });
  }

  async function saveSchedule(payload) {
    if (!storeEndpoint) return;
    const res = await fetch(storeEndpoint, {
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
      console.error('Save schedule failed:', data);
      if (typeof showToast === 'function') {
        showToast(data.message || 'Luu that bai', 'error');
      }
      return false;
    }
    return true;
  }

  function parseTimeToMinutes(time) {
    const parts = String(time || '00:00').split(':');
    const hours = Number(parts[0] || 0);
    const minutes = Number(parts[1] || 0);
    return hours * 60 + minutes;
  }

  function calcShiftMinutes(start, end) {
    let startMinutes = parseTimeToMinutes(start);
    let endMinutes = parseTimeToMinutes(end);
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    return endMinutes - startMinutes;
  }

  function daysInMonth(dateString) {
    const [year, month] = dateString.split('-').map(Number);
    if (!year || !month) return 30;
    return new Date(year, month, 0).getDate();
  }

  function calcSalaryAmount(type, rate, stats) {
    if (!rate || !stats) return 0;
    if (type === 'hour') {
      return Math.round((stats.minutes / 60) * rate);
    }
    if (type === 'shift') {
      return Math.round(stats.shiftCount * rate);
    }
    if (type === 'day') {
      return Math.round(stats.dates.size * rate);
    }
    if (type === 'month') {
      return Math.round(rate);
    }
    return 0;
  }

  function formatCurrency(value) {
    const number = Number(value || 0);
    if (!Number.isFinite(number) || number <= 0) return '0';
    return Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  async function fetchData() {
    if (!dataEndpoint) return;
    const params = new URLSearchParams({
      weekStart: formatIsoDate(currentWeekStart)
    });
    const res = await fetch(`${dataEndpoint}?${params.toString()}`);
    const data = await res.json();
    if (data.success) {
      shifts = data.shifts || [];
      staff = data.staff || [];
      schedules = data.schedules || [];
    }
  }

  async function renderAll() {
    await fetchData();
    renderHeader();
    renderBody();
    bindCellActions();
    bindChipActions();
    updateWeekLabel();

    if (staffSearch) {
      const isDisabled = viewMode !== 'staff';
      staffSearch.disabled = isDisabled;
      staffSearch.closest('.search-box')?.classList.toggle('is-disabled', isDisabled);
      if (isDisabled) {
        staffSearch.value = '';
      }
    }
  }

  document.getElementById('prevWeek')?.addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    renderAll();
  });

  document.getElementById('nextWeek')?.addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    renderAll();
  });

  btnCurrentWeek?.addEventListener('click', () => {
    currentWeekStart = getWeekStart(new Date());
    renderAll();
  });

  document.querySelectorAll('.view-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      viewMode = btn.dataset.view;
      page.dataset.view = viewMode;
      renderAll();
    });
  });

  staffSearch?.addEventListener('input', () => {
    if (viewMode !== 'staff') return;
    renderAll();
  });

  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });

  document.querySelectorAll('.schedule-modal').forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target.classList.contains('schedule-modal')) {
        modal.classList.remove('active');
      }
    });
  });

  confirmDeleteBtn?.addEventListener('click', async () => {
    if (!pendingDelete || !deleteEndpoint) return;
    const payload = {
      staff_id: pendingDelete.staffId,
      shift_id: pendingDelete.shiftId,
      work_date: pendingDelete.dateValue
    };
    const res = await fetch(deleteEndpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) {
      console.error('Delete schedule failed:', data);
      if (typeof showToast === 'function') {
        showToast(data.message || 'Xoa that bai', 'error');
      }
      return;
    }
    pendingDelete = null;
    closeModal('deleteModal');
    renderAll();
  });

  saveShiftBtn?.addEventListener('click', async () => {
    if (!activeCell) return;
    const checked = Array.from(document.querySelectorAll('#shiftStaffList input[type="checkbox"]:checked'));
    const staffIds = checked.map(input => Number(input.dataset.id)).filter(Boolean);
    if (!staffIds.length) {
      if (typeof showToast === 'function') {
        showToast('Vui long chon nhan vien', 'error');
      }
      return;
    }
    const repeatWeekly = document.querySelector('#shiftModal .repeat-toggle')?.checked;
    const payload = {
      mode: 'shift',
      date: activeCell.dataset.dateValue,
      shift_id: Number(activeCell.dataset.shiftId),
      staff_ids: staffIds,
      repeat_weekly: Boolean(repeatWeekly)
    };
    const ok = await saveSchedule(payload);
    if (ok) {
      closeModal('shiftModal');
      renderAll();
    }
  });

  saveStaffBtn?.addEventListener('click', async () => {
    if (!activeCell) return;
    const checked = Array.from(document.querySelectorAll('#staffShiftList input[type="checkbox"]:checked'));
    const shiftIds = checked.map(input => Number(input.dataset.id)).filter(Boolean);
    if (!shiftIds.length) {
      if (typeof showToast === 'function') {
        showToast('Vui long chon ca lam', 'error');
      }
      return;
    }
    const repeatWeekly = document.querySelector('#staffModal .repeat-toggle')?.checked;
    const payload = {
      mode: 'staff',
      date: activeCell.dataset.dateValue,
      staff_id: Number(activeCell.dataset.staffId),
      shift_ids: shiftIds,
      repeat_weekly: Boolean(repeatWeekly)
    };
    const ok = await saveSchedule(payload);
    if (ok) {
      closeModal('staffModal');
      renderAll();
    }
  });

  renderAll();
})();
  function formatIsoDate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
