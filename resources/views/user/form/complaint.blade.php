<div class="contact-wrapper">
    <div class="contact-container">

        <div class="contact-left">
            <h2 class="contact-title">Lẩu Tới Bến</h2>
            <p class="contact-subtitle">Phản Ánh Khiếu Nại</p>

            <div class="contact-info">
                <p><i class="fa fa-home"></i> L12-L04 KĐT Dương Nội</p>
                <p><i class="fa fa-envelope"></i> ocnamtu@gmail.com</p>
                <p><i class="fa fa-phone"></i> 0817925152</p>
            </div>

            <div class="contact-socials">
                <a href="#"><img src="{{ asset('images/web_images/icn-fb-contact.svg') }}" alt=""></a>
                <a href="#"><img src="{{ asset('images/web_images/icn-tiktok-contact.svg') }}" alt=""></a>
                <a href="#"><img src="{{ asset('images/web_images/icn-ig-contact.svg') }}" alt=""></a>
                <a href="#"><img src="{{ asset('images/web_images/icn-yt-contact.svg') }}" alt=""></a>
            </div>
        </div>

        <!-- Form Khiếu Nại -->
        <div class="contact-inner">
            <form action="{{ route('contact.store') }}" method="POST" class="contact-form">
                @csrf
                <input type="hidden" name="type" value="complaint">

                <input type="text" name="name" placeholder="Tên của bạn*">
                <input type="email" name="email" placeholder="Email*">
                <input type="text" name="phone" placeholder="Số điện thoại">
                <input type="text" name="subject" placeholder="Tiêu đề*">
                <textarea name="message" placeholder="Nhập nội dung..."></textarea>

                <button type="submit" class="contact-submit">
                    GỬI THÔNG TIN
                </button>
            </form>
        </div>
    </div>
</div>
    