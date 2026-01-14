@extends('layout.pos')

@section('title', 'VNT Pos - Thiết lập ca làm việc')

@section('content')
  @push('css')
    <link rel="stylesheet" href="{{ asset('css/pos/work-shifts.css') }}">
  @endpush

  <meta name="csrf-token" content="{{ csrf_token() }}">

  <div class="shift-page" data-list-endpoint="{{ url('/pos/work-shifts/list') }}"
       data-store-endpoint="{{ url('/pos/work-shifts') }}"
       data-update-endpoint="{{ url('/pos/work-shifts') }}"
       data-delete-endpoint="{{ url('/pos/work-shifts') }}">
    <div class="shift-header">
      <h1>Thiết lập ca làm việc</h1>
      <button class="btn-primary" id="btnAddShift">
        <i class="fas fa-plus"></i> Thêm ca
      </button>
    </div>

    <div class="shift-table">
      <div class="shift-row shift-row-head">
        <div>Tên ca</div>
        <div>Giờ bắt đầu</div>
        <div>Giờ kết thúc</div>
        <div>Nghỉ giữa ca (phút)</div>
        <div>Thao tác</div>
      </div>
      <div id="shiftBody"></div>
    </div>
  </div>

  <div class="shift-modal" id="shiftModal">
    <div class="modal-card">
      <div class="modal-header">
        <h2 id="modalTitle">Thêm ca làm việc</h2>
        <button class="modal-close" id="closeModal">×</button>
      </div>
      <form id="shiftForm">
        <input type="hidden" id="shiftId">
        <div class="form-grid">
          <div class="form-group">
            <label>Tên ca</label>
            <input type="text" id="shiftName" placeholder="Ví dụ: Ca sáng" required>
          </div>
          <div class="form-group">
            <label>Giờ bắt đầu</label>
            <input type="time" id="shiftStart" required>
          </div>
          <div class="form-group">
            <label>Giờ kết thúc</label>
            <input type="time" id="shiftEnd" required>
          </div>
          <div class="form-group">
            <label>Nghỉ giữa ca (phút)</label>
            <input type="number" id="shiftBreak" min="0" step="5" value="0">
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-outline" id="btnCancelShift">Bỏ qua</button>
          <button type="submit" class="btn-primary">Lưu</button>
        </div>
      </form>
    </div>
  </div>

  @push('js')
    <script src="{{ asset('js/pos/work-shifts.js') }}"></script>
  @endpush
@endsection
