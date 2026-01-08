@extends('layout.pos')

@section('title', 'VNT Pos - Tổng Quan')

  @push('css')
    <link rel="stylesheet" href="{{ asset('css/pos/kiot.css') }}">
  @endpush

@section('content')
  <main class="dashboard-wrapper">
    <div class="dashboard-container">
      <!-- LEFT COLUMN -->
      <div class="left-col">
        <!-- Summary Cards -->
        <section class="summary-cards">
          <div class="card">
            <div class="card-head">
              <div class="card-title">Doanh Thu</div>
              <div class="card-sub">Hôm nay</div>
            </div>
            <div class="card-value">
              <label class="dash_icon icon-revenue">
                <i class="fa fa-usd"></i>
              </label>
              <span class="card-revenue" id="ordersDone">
                {{ number_format($todayRevenue, 0, ',', '.') }}₫
              </span>
            </div>
          </div>

          <div class="card">
            <div class="card-head">
              <div class="card-title">Đã Hoàn Thành</div>
              <div class="card-sub">Đơn</div>
            </div>
            <div class="card-value">
              <label class="dash_icon icon-completed">
                <i class="fa fa-star"></i>
              </label>
              <span class="card-order" id="ordersServ">
                {{ $completedOrders }}
              </span>
            </div>
          </div>

          <div class="card">
            <div class="card-head">
              <div class="card-title">Đang Phục Vụ</div>
              <div class="card-sub">Bàn</div>
            </div>
            <div class="card-value">
              <label class="dash_icon icon-serving">
                <i class="fa fa-cutlery"></i>
              </label>
              <span class="card-serving" id="servicing">
                {{ $servicingTables }}
              </span>
            </div>
          </div>
        </section>

        <!-- Revenue + Tabs -->
        <section class="revenue-section">
          <div class="revenue-header">
            <h3>Doanh số</h3>
            <div class="revenue-controls">
              <div class="tabs">
                <button class="tab active" data-mode="hour">Theo giờ</button>
                <button class="tab" data-mode="day">Theo ngày</button>
                <button class="tab" data-mode="weekday">Theo thứ</button>
              </div>
              <div class="range-dropdown">
                <button class="range-btn">Hôm nay ▾</button>
                <div class="range-menu">
                  <div data-range="today">Hôm nay</div>
                  <div data-range="yesterday">Hôm qua</div>
                  <div data-range="7days">7 ngày qua</div>
                  <div data-range="this_month">Tháng này</div>
                  <div data-range="last_month">Tháng trước</div>
                </div>
              </div>
            </div>
          </div>
          <canvas id="revenueChart"></canvas>
        </section>

        <!-- Order / Tabs -->
        <section class="order-section">
          <div class="order-header">
            <h3>Số Đơn Hàng</h3>
            <div class="order-controls">
              <div class="tabs">
                <button class="tab active" data-mode="hour">Theo giờ</button>
                <button class="tab" data-mode="day">Theo ngày</button>
                <button class="tab" data-mode="weekday">Theo thứ</button>
              </div>
              <div class="range-dropdown">
                <button class="range-btn">Hôm nay ▾</button>
                <div class="range-menu">
                  <div data-range="today">Hôm nay</div>
                  <div data-range="yesterday">Hôm qua</div>
                  <div data-range="7days">7 ngày qua</div>
                  <div data-range="this_month">Tháng này</div>
                  <div data-range="last_month">Tháng trước</div>
                </div>
              </div>
            </div>
          </div>
          <canvas id="orderChart"></canvas>
        </section>

        <!--  / Tabs -->
        <section class="product-section">
          <div class="product-header">
            <h3>Top Hàng Hóa Bán Chạy</h3>
            <div class="product-controls">
              <div class="range-dropdown">
                <button class="range-btn metric-btn">Theo số lượng ▾</button>
                <div class="range-menu metric-menu">
                  <div data-metric="quantity">Theo số lượng</div>
                  <div data-metric="revenue">Theo doanh thu</div>
                </div>
              </div>
              <div class="range-dropdown">
                <button class="range-btn">Hôm nay ▾</button>
                <div class="range-menu">
                  <div data-range="today">Hôm nay</div>
                  <div data-range="yesterday">Hôm qua</div>
                  <div data-range="7days">7 ngày qua</div>
                  <div data-range="this_month">Tháng này</div>
                  <div data-range="last_month">Tháng trước</div>
                </div>
              </div>
            </div>
          </div>
          <canvas id="productChart"></canvas>
        </section>

      </div>

      <!-- RIGHT SIDEBAR -->
      <aside class="right-col">
        <div class="activity-head">
          <h4>Hoạt động gần đây</h4>
        </div>
        <ul class="activity-list" id="activityList">
          <!-- JS will populate -->
        </ul>
      </aside>

    </div>
  </main>
@endsection

@push('js')
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="{{ asset('js/pos/kiot.js') }}"></script>
@endpush