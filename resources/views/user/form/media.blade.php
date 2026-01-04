<div class="contact-wrapper">
    <div class="contact-container">

        <div class="contact-left">
            <h2 class="contact-title">VNT Company</h2>
            <p class="contact-subtitle">Hợp tác truyền thông</p>

            <div class="contact-info">
                <p><i class="fa fa-home"></i> 75B Đinh Tiên Hoàng</p>
                <p><i class="fa fa-envelope"></i> VNTcompany@gmail.com</p>
                <p><i class="fa fa-phone"></i> 0961581328</p>
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
                <input type="hidden" name="type" value="media">

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
    