@extends('layout.pos')

@section('title', 'VNT Pos - Liên hệ')

@section('content')
    @push('css')
        <link rel="stylesheet" href="{{ asset('css/pos/contact.css') }}">
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    @endpush

    <div class="contact-page">
        <!-- ===== LEFT SIDEBAR ===== -->
        <div class="sidebar">

            <!-- TÌM KIẾM -->
            <div class="box">
                <div class="box-title">Tìm kiếm</div>
                <input type="text" placeholder="Theo mã liên hệ" class="search-input">
                <input type="text" placeholder="Theo tên khách hàng" class="search-input">
                <input type="text" placeholder="Theo số điện thoại" class="search-input">
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
            </div>
        </div>

        <!-- ===== RIGHT CONTENT ===== -->
        <div class="content">
            <div class="content-header">
                <h2>Danh sách liên hệ</h2>
                <div class="type-filters">
                    <button class="filter-btn active" data-type="all">Tất cả</button>
                    <button class="filter-btn" data-type="complaint">Phản ánh</button>
                    <button class="filter-btn" data-type="media">Hợp tác</button>
                </div>
            </div>

            <table class="contact-table">
                <thead>
                    <tr>
                        <th>Mã liên hệ</th>
                        <th>Loại liên hệ</th>
                        <th>Tên khách hàng</th>
                        <th>Số điện thoại</th>
                        <th>Email</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>

                <tbody>
                    <!-- DỮ LIỆU -->
                    @foreach($contacts as $contact)
                        <tr class="contact-info" data-id="{{ $contact->id }}" data-code="{{ strtolower($contact->code) }}"
                            data-name="{{ strtolower($contact->name) }}" data-phone="{{ $contact->phone }}" data-type="{{ $contact->type }}"
                            data-email="{{ $contact->email }}" data-status="{{ $contact->status }}"
                            data-subject="{{ $contact->subject }}" data-message="{{ $contact->message }}" data-time="{{ strtotime($contact->created_at) }}">
                            <td>{{ $contact->code }}</td>
                            <td>{{ $contact->type }}</td>
                            <td>{{ $contact->name }}</td>
                            <td>{{ $contact->phone }}</td>
                            <td>{{ $contact->email }}</td>
                            <td>
                                @if($contact->status == 'pending')
                                    <span class="status-pill pending">Chưa xử lý</span>
                                @elseif($contact->status == 'processed')
                                    <span class="status-pill processed">Đã xử lý</span>
                                @else
                                    <span class="status-pill">{{ $contact->status }}</span>
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
            <div class="contact-pagination" id="pagination">
                <button id="prevPage" class="page-btn"><i class="fas fa-chevron-left"></i></button>
                <span id="pageInfo"></span>
                <button id="nextPage" class="page-btn"><i class="fas fa-chevron-right"></i></button>
            </div>
        </div>
    </div>
    <div id="contactModal" class="modal">
    <div class="modal-content">
        <span class="close">&times;</span>
        <h3>Chi tiết liên hệ <span id="detail-code"></span></h3>
        <hr>
        <div class="detail-grid">
            <p><strong>Khách hàng:</strong> <span id="detail-name"></span></p>
            <p><strong>Số điện thoại:</strong> <span id="detail-phone"></span></p>
            <p><strong>Email:</strong> <span id="detail-email"></span></p>
            <p><strong>Tiêu đề:</strong> <span id="detail-subject"></span></p>
        </div>
        <div class="detail-message">
            <strong>Nội dung:</strong>
            <div class="message-box" id="detail-message"></div>
        </div>
        <div class="modal-footer">
            <button class="btn-done">Đánh dấu đã xử lý</button>
        </div>
    </div>
</div>
@endsection

@push('js')
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="{{ asset('js/pos/contact.js') }}"></script>
@endpush