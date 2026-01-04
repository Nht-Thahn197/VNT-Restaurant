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
              <div class="card-title">Doanh Thu Hôm Nay</div>
              <div class="card-sub">Hôm nay</div>
            </div>
            <div class="card-value" id="ordersDone">11.370.980₫</div>
          </div>

          <div class="card">
            <div class="card-head">
              <div class="card-title">Đã Hoàn Thành</div>
              <div class="card-sub">Đơn</div>
            </div>
            <div class="card-value" id="ordersServ">10</div>
          </div>

          <div class="card">
            <div class="card-head">
              <div class="card-title">Đang Phục Vụ</div>
              <div class="card-sub">Bàn</div>
            </div>
            <div class="card-value small" id="servicing">9</div>
          </div>
        </section>

        <!-- Revenue + Tabs -->
        <section class="revenue-section">
          <div class="revenue-header">
            <h3>Doanh số</h3>
            <div class="tabs">
              <button class="tab active" data-range="day">Theo ngày</button>
              <button class="tab" data-range="hour">Theo giờ</button>
              <button class="tab" data-range="weekday">Theo thứ</button>
            </div>
          </div>
        </section>

        <!-- Order / Tabs -->
        <section class="order-section">
          <div class="order-header">
            <h3>Số Đơn Hàng</h3>
            <div class="tabs">
              <button class="tab active" data-range="day">Theo ngày</button>
              <button class="tab" data-range="hour">Theo giờ</button>
              <button class="tab" data-range="weekday">Theo thứ</button>
            </div>
          </div>
        </section>

        <!--  / Tabs -->
        <section class="product-section">
          <div class="product-header">
            <h3>Top Hàng Hóa Bán Chạy</h3>
            <div class="tabs">
              <button class="tab active" data-range="day">Theo ngày</button>
              <button class="tab" data-range="hour">Theo giờ</button>
              <button class="tab" data-range="weekday">Theo thứ</button>
            </div>
          </div>
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

@section('js')
  <script src="{{ asset('js/pos/kiot.js') }}"></script>
@endsection