@extends('layout.pos')

@section('title', 'VNT Pos - Nhập Hàng')

@section('content')

  @push('css')
    <link rel="stylesheet" href="{{ asset('css/pos/import.css') }}">
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
  @endpush

  <meta name="base-url" content="{{ url('') }}">

    <div class="import-page">
        <!-- ===== LEFT SIDEBAR ===== -->
        <div class="sidebar">

            <!-- 🔍 TÌM KIẾM -->
            <div class="box">
                <div class="box-title">Tìm kiếm</div>
                <input type="text" id="searchCode" placeholder="Theo mã phiếu" class="search-input">
                <input type="text" id="searchIngredient" placeholder="Theo tên nguyên liệu" class="search-input">
                <input type="text" id="searchStaff" placeholder="Theo người tạo" class="search-input">
            </div>

            <!-- ⏰ THỜI GIAN -->
            <div class="box">
                <div class="box-title">Thời gian</div>

                <!-- BUTTON -->
                <div class="time-dropdown">
                    <button type="button" class="input-select" id="timeBtn">
                        Toàn thời gian
                        <i class="fa fa-chevron-down"></i>
                    </button>

                    <!-- DROPDOWN -->
                    <div class="time-menu" id="timeMenu">
                        <!-- CỘT NGÀY -->
                        <div class="time-col">
                            <div class="time-col-title">Theo ngày</div>
                            <div class="time-item" data-preset="today">Hôm nay</div>
                            <div class="time-item" data-preset="yesterday">Hôm qua</div>
                        </div>

                        <!-- CỘT TUẦN -->
                        <div class="time-col">
                            <div class="time-col-title">Theo tuần</div>
                            <div class="time-item" data-preset="this_week">Tuần này</div>
                            <div class="time-item" data-preset="last_week">Tuần trước</div>
                            <div class="time-item" data-preset="last_7_days">7 ngày trước</div>
                        </div>

                        <!-- CỘT THÁNG -->
                        <div class="time-col">
                            <div class="time-col-title">Theo tháng</div>
                            <div class="time-item" data-preset="this_month">Tháng này</div>
                            <div class="time-item" data-preset="last_month">Tháng trước</div>
                            <div class="time-item" data-preset="last_30_days">30 ngày qua</div>
                        </div>

                        <!-- CỘT NĂM -->
                        <div class="time-col">
                            <div class="time-col-title">Theo năm</div>
                            <div class="time-item" data-preset="this_year">Năm nay</div>
                            <div class="time-item" data-preset="last_year">Năm trước</div>
                            <div class="time-item" data-preset="all">Toàn thời gian</div>
                        </div>
                    </div>
                </div>

                <!-- CUSTOM DATE -->
                <div class="time-custom">
                    <input
                        type="text"
                        id="dateRange"
                        class="input-text"
                        placeholder="Lựa chọn khác"
                        readonly
                    >
                    <input type="hidden" id="fromDate">
                    <input type="hidden" id="toDate">
                </div>
            </div>

            <!-- TRẠNG THÁI XỬ LÝ -->
            <div class="box collapsible">
                <div class="box-title">
                    Trạng thái
                    <span class="arrow"></span>
                </div>
                <label class="radio-item">
                    <input type="radio" name="status" value="completed" checked>
                    <span>Đã Nhập</span>
                </label>

                <label class="radio-item">
                    <input type="radio" name="status" value="cancelled">
                    <span>Đã hủy</span>
                </label>
            </div>
        </div>


        <!-- ===== RIGHT CONTENT ===== -->
        <div class="content">
            <div class="content-header">
                <h2>Phiếu nhập hàng</h2>
                @can('create_import')
                    <a href="{{ route('import.detail') }}" class="btn-add">
                        <i class="far fa-plus"></i> Nhập hàng
                    </a>
                @endcan
            </div>

            <table class="import-table">
                <thead>
                    <tr class="info">
                        <th>Mã nhập hàng</th>
                        <th>Thời gian</th>
                        <th>Người nhập</th>
                        <th>Tổng tiền hàng</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>

                <!-- DÒNG ĐẦU TIÊN — TÍNH TỔNG -->
                <tbody>
                    @php
                        $sum = $imports->sum('total_price');
                    @endphp
                        {{-- TỔNG --}}
                    <tr class="summary-row">
                        <td colspan="3" style="text-align:right;font-weight:700">
                            Tổng:
                        </td>
                        <td style="font-weight:700">
                            {{ number_format($sum) }}
                        </td>
                        <td></td>
                    </tr>


                    @foreach($imports as $import)
                    @php $sum += $import->total_price; @endphp

                    <tr class="import-row" data-id="{{ $import->id }}" data-code="{{ strtolower($import->code) }}"
                        data-staff="{{ strtolower($import->staff->name) }}" data-status="{{ $import->status }}" 
                        data-time="{{ $import->import_time->timestamp }}"
                        data-ingredients="@foreach($import->details as $d){{ strtolower($d->ingredient->name) }} @endforeach">
                        <td>{{ $import->code }}</td>
                        <td>{{ $import->import_time->format('d/m/Y H:i') }}</td>
                        <td>{{ $import->staff->name }}</td>
                        <td>{{ number_format($import->total_price) }}</td>
                        <td>
                            {{ $import->status == 'completed' ? 'Đã nhập hàng' : 'Đã hủy' }}
                        </td>
                    </tr>

                    {{-- DETAIL --}}
                    <tr class="detail-row" id="detail-{{ $import->id }}" style="display:none;">
                        <td class="detail" colspan="5">
                            <div class="detail-box">
                                <h4>Chi tiết phiếu nhập</h4>
                                <table class="detail-table">
                                    <thead>
                                        <tr>
                                            <th>Mã NL</th>
                                            <th>Tên NL</th>
                                            <th>Số lượng</th>
                                            <th>Đơn giá</th>
                                            <th>Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    @foreach($import->details as $d)
                                        <tr>
                                            <td>{{ $d->ingredient->code }}</td>
                                            <td>{{ $d->ingredient->name }}</td>
                                            <td>{{ rtrim(rtrim($d->quantity, '0'), '.') }}</td>
                                            <td>{{ number_format($d->price) }}</td>
                                            <td>{{ number_format($d->quantity * $d->price) }}</td>
                                        </tr>
                                    @endforeach
                                    </tbody>
                                </table>

                                @if ($import->status === 'completed')
                                    <form method="POST" action="{{ route('import.cancel', $import->id) }}"
                                        onsubmit="return confirm('Hủy phiếu nhập này?')">
                                        @csrf
                                        @can('delete_import')
                                            <button class="btn btn-danger"><i class="fas fa-close"></i> Hủy phiếu</button>
                                        @endcan
                                    </form>
                                @endif
                            </div>
                        </td>
                    </tr>

                    @endforeach
                </tbody>
            </table>
            <div class="import-pagination" id="pagination">
                <button id="prevPage" class="page-btn"><i class="fas fa-chevron-left"></i></button>
                <span id="pageInfo"></span>
                <button id="nextPage" class="page-btn"><i class="fas fa-chevron-right"></i></button>
            </div>
        </div>
    </div>
@endsection

@push('js')
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="{{ asset('js/pos/import.js') }}"></script>
@endpush