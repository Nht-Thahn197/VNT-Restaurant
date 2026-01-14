@extends('layout.pos')

@section('title', 'VNT Pos - Xuất Hàng')

@section('content')

  @push('css')
    <link rel="stylesheet" href="{{ asset('css/pos/exportdetail.css') }}">
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css" />
  @endpush
  <meta name="base-url" content="{{ url('') }}">

  <form id="exportForm" method="POST" action="{{ route('export.store') }}">
    @csrf
    <div id="hiddenInputs"></div>
    <div class="ingredient-search">
        <h1>Xuất hàng</h1>
        <div class="ingredient-input-wrap">
            <input type="text" placeholder="Tìm nguyên liệu theo mã hoặc theo tên" id="ingredientSearch">
            <div id="ingredientSuggest" class="suggest-box"></div>
        </div>
    </div>
    <div class="main-content">
        <div class="left-box">
            <table id="ingredient-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã hàng</th>
                        <th>Tên hàng</th>
                        <th>Số lượng</th>
                        <th>Tồn kho</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                        <th>Xóa</th>
                    </tr>
                </thead>
                <tbody id="ingredientList">

                </tbody>
            </table>
        </div>
        <div class="right-box">
            <label>Nhân viên</label>

            <input type="text"
                value="{{ auth()->user()->name }}"
                readonly
                class="readonly-input">

            <input type="hidden"
                name="staff_id"
                value="{{ auth()->user()->id }}">

            <label>Thời gian</label>
            <input type="hidden"
                name="export_time"
                id="export_time"
                value="{{ now()->format('Y-m-d H:i') }}">
            <input type="text"
                id="export_time_display"
                class="datetime-input"
                value="{{ now()->format('d/m/Y H:i') }}"
                autocomplete="off">

            <label>Tổng tiền</label>
            <input type="text" id="totalAmount" name="total_amount" value="0" readonly>

            <label>Ghi chú</label>
            <textarea name="note" rows="4" placeholder="Nhập ghi chú..."></textarea>

            <button type="submit" value="completed" class="complete">
                Hoàn thành
            </button>
        </div>
    </div>
  </form>
@endsection

@push('js')
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js"></script>
    <script src="{{ asset('js/pos/exportdetail.js') }}"></script>
@endpush