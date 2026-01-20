(() => {
  const page = document.querySelector('.shift-page');
  if (!page) return;

  const listEndpoint = page.dataset.listEndpoint;
  const storeEndpoint = page.dataset.storeEndpoint;
  const updateEndpoint = page.dataset.updateEndpoint;
  const deleteEndpoint = page.dataset.deleteEndpoint;

  const shiftBody = document.getElementById('shiftBody');
  const btnAddShift = document.getElementById('btnAddShift');
  const modal = document.getElementById('shiftModal');
  const closeModalBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('btnCancelShift');
  const form = document.getElementById('shiftForm');
  const modalTitle = document.getElementById('modalTitle');

  const shiftId = document.getElementById('shiftId');
  const shiftName = document.getElementById('shiftName');
  const shiftStart = document.getElementById('shiftStart');
  const shiftEnd = document.getElementById('shiftEnd');
  const shiftBreak = document.getElementById('shiftBreak');

  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

  const openModal = (mode) => {
    modal.classList.add('active');
    modalTitle.textContent = mode === 'edit' ? 'Cập nhật ca làm việc' : 'Thêm ca làm việc';
  };

  const closeModal = () => {
    modal.classList.remove('active');
    form.reset();
    shiftId.value = '';
    shiftBreak.value = '0';
  };

  const renderRows = (shifts) => {
    shiftBody.innerHTML = '';
    shifts.forEach((shift) => {
      const row = document.createElement('div');
      row.className = 'shift-row';
      row.innerHTML = `
        <div>${shift.name}</div>
        <div>${shift.start_time}</div>
        <div>${shift.end_time}</div>
        <div>${shift.break_minutes ?? 0}</div>
        <div class="shift-actions">
          <button data-action="edit" data-id="${shift.id}">Sửa</button>
          <button class="danger" data-action="delete" data-id="${shift.id}">Xóa</button>
        </div>
      `;
      shiftBody.appendChild(row);
    });
  };

  const fetchJson = async (url, options = {}) => {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      throw new Error(text || 'Invalid JSON response');
    }
    return res.json();
  };

  const fetchList = async () => {
    try {
      const data = await fetchJson(listEndpoint);
      if (data.success) {
        renderRows(data.shifts || []);
      }
    } catch (err) {
      console.error('Load shifts failed:', err);
    }
  };

  btnAddShift?.addEventListener('click', () => {
    openModal('add');
  });

  closeModalBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  shiftBody?.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.dataset.action;
    const id = target.dataset.id;
    if (!action || !id) return;

    if (action === 'edit') {
      const row = target.closest('.shift-row');
      if (!row) return;
      const cells = row.querySelectorAll('div');
      shiftId.value = id;
      shiftName.value = cells[0]?.textContent?.trim() || '';
      shiftStart.value = cells[1]?.textContent?.trim() || '';
      shiftEnd.value = cells[2]?.textContent?.trim() || '';
      shiftBreak.value = cells[3]?.textContent?.trim() || '0';
      openModal('edit');
    }

    if (action === 'delete') {
      if (!await openConfirmDialog('Bạn có chắc muốn xóa ca này?')) return;
      try {
        await fetchJson(`${deleteEndpoint}/${id}`, {
          method: 'DELETE',
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
          }
        });
        fetchList();
      } catch (err) {
        console.error('Delete shift failed:', err);
      }
    }
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = new FormData();
    payload.append('name', shiftName.value.trim());
    payload.append('start_time', shiftStart.value);
    payload.append('end_time', shiftEnd.value);
    payload.append('break_minutes', shiftBreak.value || '0');

    const isEdit = Boolean(shiftId.value);
    const url = isEdit ? `${updateEndpoint}/${shiftId.value}` : storeEndpoint;

    try {
      const data = await fetchJson(url, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json'
        },
        body: payload
      });
      if (data.success) {
        closeModal();
        fetchList();
      } else {
        console.error('Save shift error:', data.errors || data.message || data);
        if (typeof showToast === 'function') {
          showToast(data.message || 'Dữ liệu không hợp lệ', 'error');
        } else {
          alert(data.message || 'Dữ liệu không hợp lệ');
        }
      }
    } catch (err) {
      console.error('Save shift failed:', err);
    }
  });

  fetchList();
})();
