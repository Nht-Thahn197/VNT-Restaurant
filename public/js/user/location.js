document.addEventListener('DOMContentLoaded', function() {
    const locations = window.locations || [];
    const regions = window.regions || [];

    const openBookingBtn = document.getElementById('openBooking');
    const bookingOverlay = document.getElementById('bookingOverlay');
    const closeBookingBtn = document.getElementById('closeBooking2');

    const resetBookingOverlayStyles = () => {
        if (!bookingOverlay) return;
        const overlayProps = ['display', 'visibility', 'opacity', 'pointer-events', 'z-index', 'position', 'top', 'left', 'width', 'height'];
        overlayProps.forEach(prop => bookingOverlay.style.removeProperty(prop));
        const popup = bookingOverlay.querySelector('.booking-popup');
        if (popup) {
            ['display', 'visibility', 'opacity', 'pointer-events'].forEach(prop => popup.style.removeProperty(prop));
        }
    };

    const openBookingOverlay = () => {
        if (!bookingOverlay) return;
        resetBookingOverlayStyles();
        bookingOverlay.classList.add('active');
        document.body.style.setProperty('pointer-events', 'auto', 'important');
    };

    const closeBookingOverlay = () => {
        if (!bookingOverlay) return;
        bookingOverlay.classList.remove('active');
        resetBookingOverlayStyles();
        document.body.style.setProperty('pointer-events', 'auto', 'important');
    };

    if (openBookingBtn && bookingOverlay) {
        openBookingBtn.addEventListener('click', () => {
            const dropdown = bookingOverlay.querySelector('.custom-dropdown[data-placeholder="Lựa chọn cơ sở"]');
            if (dropdown) {
                const selectedText = dropdown.querySelector('.selected-text');
                const hidden = dropdown.querySelector('input[type="hidden"]');
                if (selectedText) selectedText.textContent = 'Lựa chọn cơ sở';
                if (hidden) hidden.value = '';
            }
            const inputs = bookingOverlay.querySelectorAll('input[type="text"], textarea');
            inputs.forEach(input => input.value = '');

            openBookingOverlay();
        });
    }
    if (closeBookingBtn && bookingOverlay) {
        closeBookingBtn.addEventListener('click', () => {
            closeBookingOverlay();
        });
    }

    document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
        const selected = dropdown.querySelector('.dropdown-selected');
        const list = dropdown.querySelector('.dropdown-list');
        const selectedText = dropdown.querySelector('.selected-text');

        selected.addEventListener('click', () => {
            list.classList.toggle('show');
        });

        list.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                selectedText.textContent = li.textContent;
                list.classList.remove('show');
                const hidden = dropdown.querySelector('input[type="hidden"]');
                if (hidden) {
                    hidden.value = li.getAttribute('value');
                }
            });
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-dropdown')) {
            document.querySelectorAll('.dropdown-list').forEach(list => list.classList.remove('show'));
        }
    });

    function bookLocation(id) {
        console.log('bookLocation called with id:', id);
        if (bookingOverlay) {
            console.log('Opening booking overlay');
            openBookingOverlay();
            const closeOverlay = (e) => {
                if (e.target === bookingOverlay) {
                    closeBookingOverlay();
                    bookingOverlay.removeEventListener('click', closeOverlay);
                }
            };
            bookingOverlay.addEventListener('click', closeOverlay);
            const dropdown = bookingOverlay.querySelector('.custom-dropdown[data-placeholder="Lựa chọn cơ sở"]');
            if (dropdown) {
                const selectedText = dropdown.querySelector('.selected-text');
                const hidden = dropdown.querySelector('input[type="hidden"]');
                const listItems = dropdown.querySelectorAll('.dropdown-list li');
                listItems.forEach(li => {
                    if (li.getAttribute('value') == id) {
                        selectedText.textContent = li.textContent;
                        if (hidden) hidden.value = id;
                        console.log('Set location to:', li.textContent);
                    }
                });
            }
        } else {
            console.log('bookingOverlay not found');
        }
    }

    function setMapButton(button, mapUrl) {
        if (!button) return;
        button.dataset.mapUrl = mapUrl || '';
        button.disabled = !mapUrl;
        button.onclick = () => {
            const url = button.dataset.mapUrl || '';
            if (url) {
                window.open(url, '_blank', 'noopener');
            }
        };
    }

    document.querySelectorAll('#menuScroll a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('#menuScroll a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
            const regionId = this.dataset.region;
            filterLocations(regionId);
        });
    });

    function filterLocations(regionId) {
        let filtered = locations;
        if (regionId) {
            filtered = locations.filter(loc => loc.region_id == regionId);
        }
        if (filtered.length > 0) {
            const location = filtered[0];
            updateLocationDisplay(location);
        } else {
            document.querySelector('.location-section').innerHTML = '<p>Không có cơ sở nào trong khu vực này.</p>';
        }
    }

    function updateLocationDisplay(location) {
        const container = document.querySelector('.location-container');
        if (!container) return;

        container.dataset.region = location.region_id;
        container.querySelector('h2').textContent = location.name;
        container.querySelector('p').textContent = location.description || 'Chốn ăn chơi lý tưởng';
        container.querySelector('.open').textContent = location.status === 'active' ? 'ĐANG MỞ' : 'ĐÓNG CỬA';
        container.querySelector('.time').textContent = `HOẠT ĐỘNG TỪ ${location.formatted_time_start} – ${location.formatted_time_end}`;
        container.querySelectorAll('.info-location div strong')[0].textContent = (location.capacity || '---') + ' KHÁCH';
        container.querySelectorAll('.info-location div strong')[1].textContent = location.area ? `${Number(location.area).toLocaleString()} M²` : '---';
        container.querySelectorAll('.info-location div strong')[2].textContent = (location.floors || '---') + ' TẦNG';
        container.querySelector('.location-image img').src = window.assetUrl + (location.thumbnail || 'L12L04.jpg');
        container.querySelector('.location-image img').alt = location.name;
        const bookBtn = container.querySelector('.book');
        bookBtn.onclick = null;
        bookBtn.addEventListener('click', () => bookLocation(location.id));

        const mapBtn = container.querySelector('.map');
        setMapButton(mapBtn, location.map_url);
    }

    if (locations.length > 0) {
        const bookBtn = document.querySelector('.book');
        if (bookBtn) {
            bookBtn.addEventListener('click', () => bookLocation(locations[0].id));
        }
        const mapBtn = document.querySelector('.map');
        setMapButton(mapBtn, locations[0].map_url);
    }
});
