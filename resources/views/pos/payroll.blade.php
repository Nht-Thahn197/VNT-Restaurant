@extends('layout.pos')

@section('title', 'VNT Pos - Bảng lương')

@section('content')
    @push('css')
        <link rel="stylesheet" href="{{ asset('css/pos/payroll.css') }}">
    @endpush

    <div class="payroll-page">
        @if (session('success'))
            <div class="alert alert-success">{{ session('success') }}</div>
        @endif
        @if (session('error'))
            <div class="alert alert-error">{{ session('error') }}</div>
        @endif
        @if ($errors->any())
            <div class="alert alert-error">{{ $errors->first() }}</div>
        @endif
        <div class="payroll-header">
            <div class="title-wrap">
                <div class="title-label">Bảng lương</div>
                <h2>Bảng lương</h2>
                <div class="summary">
                    <div class="summary-item">
                        <span>Tổng bảng lương</span>
                        <strong>{{ number_format($totalFinalSalary, 0, ',', '.') }} đ</strong>
                    </div>
                    <div class="summary-item">
                        <span>Tổng nhân viên</span>
                        <strong>{{ $payrolls->count() }}</strong>
                    </div>
                </div>
            </div>

            <form class="payroll-filters" method="GET">
                <div class="filter-group">
                    <label for="payrollMonthDisplay">Tháng</label>
                <input type="month" id="payrollMonth" name="month" class="native-month" value="{{ $filters['month'] ?? '' }}">
                <div class="payroll-control" data-payroll-month>
                    <button type="button" class="payroll-trigger" id="payrollMonthDisplay" aria-expanded="false" aria-controls="payrollMonthPanel">
                        <span class="payroll-value is-placeholder" id="payrollMonthText" data-placeholder="--">--</span>
                        <i class="fas fa-calendar"></i>
                    </button>
                    <div class="payroll-month-panel" id="payrollMonthPanel" aria-hidden="true">
                        <div class="month-header">
                            <button type="button" class="month-nav" data-dir="-1" aria-label="Prev year">&#8249;</button>
                            <span class="month-year" id="payrollMonthYear"></span>
                            <button type="button" class="month-nav" data-dir="1" aria-label="Next year">&#8250;</button>
                        </div>
                        <div class="month-grid" id="payrollMonthGrid"></div>
                        <div class="month-actions">
                            <button type="button" class="month-clear">X&#243;a</button>
                            <button type="button" class="month-current">Th&#225;ng n&#224;y</button>
                        </div>
                    </div>
                </div>
            </div>
                <div class="filter-group">
                    <label for="payrollStatusDisplay">Trạng thái</label>
                <div class="custom-select" data-payroll-select>
                    <button type="button" class="payroll-trigger" id="payrollStatusDisplay" aria-expanded="false" aria-controls="payrollStatusMenu">
                        <span class="payroll-value" id="payrollStatusText"></span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="payroll-menu" id="payrollStatusMenu" aria-hidden="true"></div>
                    <select class="native-select" id="payrollStatus" name="status">
                        <option value="" {{ empty($filters['status']) ? 'selected' : '' }}>Tất cả</option>
                        <option value="draft" {{ ($filters['status'] ?? '') === 'draft' ? 'selected' : '' }}>Tạm tính</option>
                        <option value="paid" {{ ($filters['status'] ?? '') === 'paid' ? 'selected' : '' }}>Đã trả</option>
                    </select>
                </div>
            </div>
                <div class="filter-group search-group">
                    <label for="payrollSearch">Tìm kiếm</label>
                    <input
                        type="text"
                        id="payrollSearch"
                        name="q"
                        value="{{ $filters['q'] ?? '' }}"
                        placeholder="Tên hoặc mã nhân viên"
                    >
                </div>
                <div class="filter-actions">
                    <button type="submit" class="btn-primary">Lọc</button>
                    <a href="{{ url('/pos/payroll') }}" class="btn-secondary">Xóa lọc</a>

                    <button type="submit" class="btn-primary" form="payrollGenerateForm" id="payrollGenerateBtn">Tổng hợp</button>
                </div>
            </form>
            <form id="payrollGenerateForm" method="POST" action="{{ route('pos.payroll.generate') }}">
                @csrf
                <input type="hidden" name="month" id="payrollGenerateMonth" value="{{ $filters['month'] ?? '' }}">
            </form>
        </div>

        <div class="table-card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Mã NV</th>
                        <th>Nhân viên</th>
                        <th>Tháng</th>
                        <th>Phút công</th>
                        <th>Lương cơ bản</th>
                        <th>Thưởng</th>
                        <th>Phạt</th>
                        <th>Thực nhận</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($payrolls as $row)
                        @php
                            $final = $row->final_salary;
                            if ($final === null) {
                                $final = ($row->base_salary ?? 0) + ($row->bonus ?? 0) - ($row->penalty ?? 0);
                            }
                            $isPaid = $row->status === 'paid';
                            $statusLabel = $isPaid ? 'Đã thanh toán' : 'Tạm tính';
                            $formId = 'payroll-form-' . $row->id;
                            $updatedAt = $row->updated_at
                                ? \Carbon\Carbon::parse($row->updated_at)->format('d/m/Y')
                                : '-';
                        @endphp
                            <tr class="{{ $isPaid ? 'row-paid' : '' }}">
                            <td>{{ $row->staff_code ?? '-' }}</td>
                            <td>
                                <div class="staff-name">{{ $row->staff_name ?? 'Không rõ' }}</div>
                                <div class="staff-id">#{{ $row->staff_id }}</div>
                            </td>
                            <td>{{ $row->month }}</td>
                            <td>{{ number_format($row->total_minutes ?? 0, 0, ',', '.') }}</td>
                            <td>{{ number_format($row->base_salary ?? 0, 0, ',', '.') }}</td>
                            <td>
                                @if ($isPaid)
                                    {{ number_format($row->bonus ?? 0, 0, ',', '.') }}
                                @else
                                    <input type="text" name="bonus" inputmode="decimal" class="money-input" value="{{ $row->bonus ?? 0 }}" data-money="1" form="{{ $formId }}" autocomplete="off">
                                @endif
                            </td>
                            <td>
                                @if ($isPaid)
                                    {{ number_format($row->penalty ?? 0, 0, ',', '.') }}
                                @else
                                    <input type="text" name="penalty" inputmode="decimal" class="money-input" value="{{ $row->penalty ?? 0 }}" data-money="1" form="{{ $formId }}" autocomplete="off">
                                @endif
                            </td>
                            <td class="final-salary">{{ number_format($final, 0, ',', '.') }}</td>
                            <td>
                                <div class="status-cell">
                                    <span class="status-pill status-{{ $row->status }}">{{ $statusLabel }}</span>
                                    <span class="updated-at">{{ $updatedAt }}</span>
                                </div>
                            </td>
                            <td class="action-cell">
                                <div class="row-actions">
                                    @if ($isPaid)
                                        <span class="locked-text">Đã chốt</span>
                                    @else
                                        <form id="{{ $formId }}" method="POST" action="{{ route('pos.payroll.update', $row->id) }}">
                                            @csrf
                                            <input type="hidden" name="month" value="{{ $filters['month'] ?? '' }}">
                                            <button type="submit" class="btn-secondary btn-small">Lưu</button>
                                            <button type="submit" formmethod="POST" formaction="{{ route('pos.payroll.pay', $row->id) }}" class="btn-primary btn-small">Chốt</button>
                                        </form>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="10" class="empty-state">Chưa có dữ liệu bảng lương.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    @push('js')
        <script src="{{ asset('js/pos/payroll.js') }}"></script>
    @endpush
@endsection
