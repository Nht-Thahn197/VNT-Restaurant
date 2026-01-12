@extends('layout.pos')

@section('title', 'VNT Pos - Hóa Đơn')

@section('content')
  @push('css')
    <link rel="stylesheet" href="{{ asset('css/pos/invoice.css') }}">
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
  @endpush
    <div class="invoice-page">
        <!-- ===== LEFT SIDEBAR ===== -->
        <div class="sidebar">

            <!-- TÌM KIẾM -->
            <div class="box">
                <div class="box-title">Tìm kiếm</div>
                <input type="text" placeholder="Theo mã hóa đơn" class="search-input">
                <input type="text" placeholder="Theo tên sản phẩm" class="search-input">
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
                    Trạng thái xử lý
                    <span class="arrow"></span>
                </div>

                <label class="radio-item">
                    <input type="radio" name="status" value="all" checked>
                    <span>Tất cả</span>
                </label>

                <label class="radio-item">
                    <input type="radio" name="status" value="serving">
                    <span>Đang xử lý</span>
                </label>

                <label class="radio-item">
                    <input type="radio" name="status" value="completed">
                    <span>Hoàn thành</span>
                </label>

                <label class="radio-item">
                    <input type="radio" name="status" value="cancel">
                    <span>Đã hủy</span>
                </label>
            </div>

            <!-- PHƯƠNG THỨC THANH TOÁN -->
            <div class="box collapsible">
                <div class="box-title">
                    Phương thức
                    <span class="arrow"></span>
                </div>

                <label class="checkbox-item">
                    <input type="checkbox" name="payment" value="cash">
                    <span>Tiền mặt</span>
                </label>

                <label class="checkbox-item">
                    <input type="checkbox" name="payment" value="transfer">
                    <span>Chuyển khoản</span>
                </label>

                <label class="checkbox-item">
                    <input type="checkbox" name="payment" value="card">
                    <span>Thẻ</span>
                </label>
            </div>

            <!-- PHÒNG / BÀN -->
            <div class="box collapsible">
                <div class="box-title">
                    Phòng/Bàn
                    <span class="arrow"></span>
                </div>

                <div class="custom-dropdown mb-3" id="areaDropdown">
                    <div class="selected-display">
                        <span id="currentAreaText">Chọn khu vực</span>
                        <i class="fa-solid fa-chevron-down arrow-icon"></i>
                    </div>
                    <ul class="dropdown-list">
                        <li data-value="">Chọn khu vực</li>
                        @foreach ($areas as $area)
                            <li data-value="{{ $area->id }}">{{ $area->name }}</li>
                        @endforeach
                    </ul>
                    <input type="hidden" id="filter-area" name="area_id">
                </div>

                <div class="custom-dropdown" id="tableDropdown">
                    <div class="selected-display">
                        <span id="currentTableText">Chọn phòng/bàn</span>
                        <i class="fa-solid fa-chevron-down arrow-icon"></i>
                    </div>
                    <ul class="dropdown-list">
                        <li data-value="">Chọn phòng/bàn</li>
                        @foreach ($tables as $table)
                            <li data-value="{{ $table->id }}" data-area-id="{{ $table->area_id }}">
                                {{ $table->name }}
                            </li>
                        @endforeach
                    </ul>
                    <input type="hidden" id="filter-table" name="table_id">
                </div>
            </div>
        </div>

        <!-- ===== RIGHT CONTENT ===== -->
        <div class="content">
            <div class="content-header">
                <h2>Hóa đơn</h2>
            </div>

            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Mã hóa đơn</th>
                        <th>Phòng/Bàn</th>
                        <th>Giờ đến</th>
                        <th>Giờ đi</th>
                        <th>Người nhận đơn</th>
                        <th>Tổng tiền hàng</th>
                        <th>Giảm giá</th>
                        <th>Khách cần trả</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>

                
                <tbody>
                    <!-- DÒNG ĐẦU TIÊN — TÍNH TỔNG -->
                    <tr class="summary-row">
                        <td colspan="5" style="text-align:right;font-weight:700;">Tổng:</td>
                        <td id="sum-money">0</td>
                        <td id="sum-discount">0</td>
                        <td id="sum-final">0</td>
                        <td></td>
                    </tr>

                    <!-- DỮ LIỆU -->
                    @foreach($invoices as $invoice)
                        @php
                            $productNames = $invoice->details
                                ->map(function ($d) {
                                    return strtolower($d->product->name ?? '');
                                })
                                ->filter()
                                ->implode(' ');
                        @endphp
                        <tr class="invoice-row" data-id="{{ $invoice->id }}" data-code="{{ strtolower($invoice->code) }}"
                            data-product="{{ strtolower($productNames) }}"
                            data-area="{{ strtolower($invoice->table->area->name ?? '') }}"
                            data-area-id="{{ $invoice->table->area->id ?? '' }}"  
                            data-status="{{ $invoice->status }}" data-table="{{ strtolower($invoice->table->name ?? '') }}" 
                            data-table-id="{{ $invoice->table->id ?? '' }}"
                            data-time="{{ $invoice->time_start ? $invoice->time_start->timestamp : '' }}" data-payment="{{ $invoice->payment_method }}">
                            <td>{{ $invoice->code }}</td>
                            <td>{{ $invoice->table ? $invoice->table->name : 'Chưa gán bàn' }}</td>
                            <td>{{ $invoice->time_start ? $invoice->time_start->format('d/m/Y H:i') : '-' }}</td>
                            <td>{{ $invoice->time_end ? $invoice->time_end->format('d/m/Y H:i') : '-' }}</td>
                            <td>{{ $invoice->user ? $invoice->user->name : '-' }}</td>
                            <td class="money" data-value="{{ $invoice->total ?? 0 }}">{{ number_format($invoice->total ?? 0, 0, ',', '.') }}</td>
                            <td class="discount" data-value="{{ $invoice->discount ?? 0 }}">{{ number_format($invoice->discount ?? 0, 0, ',', '.') }}</td>
                            <td class="final" data-value="{{ $invoice->pay_amount ?? 0 }}">{{ number_format($invoice->pay_amount ?? 0, 0, ',', '.') }}</td>
                            <td>{{ $invoice->status == 'completed' ? 'Hoàn thành' : 'Đang phục vụ' }}</td>
                        </tr>
                        <tr class="invoice-detail" id="detail-{{ $invoice->id }}">
                            <td class="detail" colspan="9">
                                <div class="detail-box">
                                    <table class="detail-table">
                                        <thead>
                                            <tr>
                                                <th>Mã hàng</th>
                                                <th>Tên hàng</th>
                                                <th>Đơn giá</th>
                                                <th>Số lượng</th>
                                                <th>Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach($invoice->details as $item)
                                                <tr>
                                                    <td>{{ $item->product->code ?? '-' }}</td>
                                                    <td>{{ $item->product->name ?? '-' }}</td>
                                                    <td>{{ number_format($item->price, 0, ',', '.') }}</td>
                                                    <td>{{ $item->quantity }}</td>
                                                    <td>{{ number_format($item->price * $item->quantity, 0, ',', '.') }}</td>
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>

                                    <div class="detail-actions">
                                        @can('cancel_invoice')
                                            <button class="btn-cancel" data-id="{{ $invoice->id }}"><i class="fas fa-close"></i> Hủy hóa đơn</button>
                                        @endcan
                                    </div>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
            <div class="invoice-pagination" id="pagination">
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
    <script src="{{ asset('js/pos/invoice.js') }}"></script>
@endpush
