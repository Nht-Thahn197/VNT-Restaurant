<!-- HEADER START -->
<header class="header">
    <div class="left-group">
        <a href="{{ route('home') }}" class="logo">
            <img src="{{ asset('images/logo/logo-user.png') }}">
        </a>
        <div class="hotline">
            <span class="label">HOTLINE</span>
            <br/>
            <span class="number">0961581328</span> 
        </div>
    </div>
    <div class="list">
        <li><a class="{{ request()->routeIs('menu') ? 'active' : '' }}" href="{{ route('menu') }}">THỰC ĐƠN</a></li>
        <li><a class="{{ request()->routeIs('location') ? 'active' : '' }}" href="{{ route('location') }}">CƠ SỞ</a></li>
        <li><a class="{{ request()->routeIs('news') ? 'active' : '' }}" href="{{ route('news') }}">ƯU ĐÃI</a></li>
        <li><a class="{{ request()->routeIs('contact') ? 'active' : '' }}" href="{{ route('contact') }}">LIÊN HỆ</a></li>
        <li><button class="btn-booking" type="button" id="openBooking">ĐẶT BÀN</button></li>
        <div class="booking-overlay" id="bookingOverlay">
            <div class="booking-popup">
                <h2>Đặt bàn</h2>
                <!-- Thông tin của bạn -->
                <div class="booking-section">
                    <h4><span class="yellow-bar"></span> Thông tin của bạn</h4>
                    <input type="text" placeholder="Tên của bạn" />
                    <input type="text" placeholder="Số điện thoại" />
                </div>

                <!-- Thông tin đặt bàn -->
                <div class="booking-section">
                    <h4><span class="yellow-bar"></span> Thông tin đặt bàn</h4>
                    <!-- Dropdown: Chọn cơ sở -->
                    <div class="custom-dropdown" data-placeholder="Lựa chọn cơ sở">
                        <div class="dropdown-selected">
                            <span class="selected-text">Lựa chọn cơ sở</span>
                            <span class="arrow"></span>
                        </div>
                        <ul class="dropdown-list">
                            <li value="">Lựa chọn cơ sở</li>
                            @foreach($locations as $location)
                                <li value="{{ $location->id }}">{{ $location->name }}</li>
                            @endforeach
                        </ul>
                    </div>
                    <div class="row">
                        <div class="field">
                            <label>Số lượng khách</label>
                            <div class="guest">
                                <button class="minus">−</button>
                                <input class="guest-input" type="number" value="1" min="1" />
                                <button class="plus">+</button>
                            </div>
                        </div>
                        <div class="field">
                            <label>Ngày đặt</label>
                            <button id="openCalendarBtn" class="date-trigger" type="button" aria-haspopup="dialog" aria-expanded="false">
                                <span id="dateText">--/--</span>
                                <svg class="calendar-icon" width="10" height="7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M7 11H9" stroke="#1B4E30" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M15 11H17" stroke="#1B4E30" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#1B4E30" stroke-width="1.2"/>
                                    <path d="M16 2V6" stroke="#1B4E30" stroke-width="1.5" stroke-linecap="round"/>
                                    <path d="M8 2V6" stroke="#1B4E30" stroke-width="1.5" stroke-linecap="round"/>
                                </svg>
                            </button>
                            <!-- hidden input to hold full dd/mm/yyyy value for form submission -->
                            <input type="hidden" name="booking_date" id="bookingDateHidden" value="">
                            <!-- Calendar modal (initially hidden). Put near end of body -->
                            <div id="calendarModal" class="calendar-modal" role="dialog" aria-modal="true" aria-hidden="true">
                                <div class="calendar-backdrop" id="calendarBackdrop"></div>
                                <div class="calendar-box" role="document" aria-labelledby="calendarTitle">
                                    <div class="calendar-head">
                                        <button id="calPrev" class="cal-nav" aria-label="Tháng trước">◀</button>
                                        <div id="calendarTitle" class="cal-title" aria-live="polite">Tháng 11 2025</div>
                                        <button id="calNext" class="cal-nav" aria-label="Tháng sau">▶</button>
                                    </div>
                                    <table class="calendar-table" aria-hidden="false">
                                        <thead>
                                            <tr>
                                                <th>CN</th><th>T2</th><th>T3</th><th>T4</th><th>T5</th><th>T6</th><th>T7</th>
                                            </tr>
                                        </thead>
                                        <tbody id="calendarBody"></tbody>
                                    </table>
                                    <div class="calendar-footer">
                                        <button id="calToday" class="cal-btn">Hôm nay</button>
                                        <button id="calClose" class="cal-btn light">Đóng</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Dropdown: Chọn giờ -->
                        <div class="field">
                            <label>Giờ đến</label>
                            <div class="custom-dropdown" data-placeholder="Chọn giờ">
                                <div class="dropdown-selected">
                                    <span class="selected-text">Chọn giờ</span>
                                    <span class="arrow"></span>
                                </div>
                                <ul class="dropdown-list">
                                    <li>09:30</li><li>10:00</li><li>10:30</li><li>11:00</li><li>11:30</li>
                                    <li>12:00</li><li>12:30</li><li>13:00</li><li>13:30</li><li>16:00</li>
                                    <li>16:30</li><li>17:00</li><li>17:30</li><li>18:00</li><li>18:30</li>
                                    <li>19:00</li><li>19:30</li><li>20:00</li><li>20:30</li><li>21:00</li>
                                    <li>21:30</li><li>22:00</li><li>22:30</li><li>23:00</li><li>23:30</li>
                                    <li>00:00</li><li>00:30</li><li>01:00</li><li>01:30</li><li>02:00</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <!-- Dropdown: Chọn ưu đãi -->
                    <div class="custom-dropdown" data-placeholder="Chọn ưu đãi">
                        <div class="dropdown-selected">
                            <span class="selected-text">Chọn ưu đãi</span>
                            <span class="arrow"></span>
                        </div>
                        <ul class="dropdown-list">
                            <li value="">Chọn ưu đãi</li>
                            @foreach($promotions as $promotion) 
                                <li value="{{ $promotion->id }}">{{ $promotion->name }}</li> 
                            @endforeach
                        </ul>
                        <input type="hidden" name="promotion_id" id="promotion_id">
                    </div>
                    <textarea placeholder="Ghi chú"></textarea>
                </div>
                <div class="action-row">
                    <button class="cancel-btn" id="closeBooking2">Đóng</button>
                    <button type="button" class="submit-btn">ĐẶT BÀN NGAY</button>
                </div>
            </div>
        </div>
    </div>    
</header>
<!-- HEADER END -->