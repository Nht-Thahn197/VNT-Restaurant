// --------- helper random data ----------
function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }
function currency(v){ return v.toLocaleString('vi-VN') + '₫'; }

// ---------- Activity mock ----------
const activities = [
  {t:'08:12', txt: 'Khách đặt bàn 4 người - Cơ sở Hà Đông'},
  {t:'08:45', txt: 'Hoàn thành đơn #1234 - Ốc hương'},
  {t:'09:10', txt: 'Nhập kho 10kg nghêu'},
  {t:'10:02', txt: 'Khách gọi đặt giao hàng - 2 phần'},
  {t:'11:05', txt: 'Đổi trạng thái bàn B12 -> Đang phục vụ'},
  {t:'12:00', txt: 'Khách check-in, áp dụng KM 10%'},
];

const actList = document.getElementById('activityList');
activities.forEach(a=>{
  const li = document.createElement('li');
  li.className = 'activity-item';
  li.innerHTML = `<div class="activity-dot">!</div>
                  <div class="activity-content">
                    <div class="activity-time">${a.t}</div>
                    <div class="activity-text">${a.txt}</div>
                  </div>`;
  actList.appendChild(li);
});

// ---------- Chart.js setup ----------
const ctx = document.getElementById('revenueChart').getContext('2d');

let currentRange = 'day';

function generateLabels(range){
  if(range==='day'){
    // show last 7 days
    const d = new Date();
    const arr=[];
    for(let i=6;i>=0;i--){
      const dt = new Date(d); dt.setDate(d.getDate()-i);
      arr.push(dt.getDate()+ '/' + (dt.getMonth()+1));
    }
    return arr;
  } else if(range==='hour'){
    const arr=[]; for(let h=6; h<=22; h+=2) arr.push(h + ':00'); return arr;
  } else { // weekday
    return ['CN','T2','T3','T4','T5','T6','T7'];
  }
}

function generateData(range){
  const labels = generateLabels(range);
  return labels.map(()=> randInt(0, 1200000));
}

let chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: generateLabels(currentRange),
    datasets: [{
      label: 'Doanh số',
      data: generateData(currentRange),
      fill: true,
      borderColor: 'rgba(27,78,48,0.95)',
      backgroundColor: 'rgba(27,78,48,0.12)',
      tension: 0.25,
      pointRadius: 3,
      pointBackgroundColor: 'rgba(27,78,48,1)'
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: {display:false} },
      y: { ticks: { callback: v => (v>=1000? (v/1000)+'k' : v) } }
    }
  }
});

// Tabs
document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');
    currentRange = btn.dataset.range;
    updateChart();
  });
});

function updateChart(){
  const labels = generateLabels(currentRange);
  const data = generateData(currentRange);
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

// optional: refresh random data every 20s (demo)
setInterval(()=> {
  // randomize small values in cards
  document.getElementById('ordersDone').textContent = randInt(5, 90);
  document.getElementById('ordersServ').textContent = randInt(0, 12);
  document.getElementById('customersToday').textContent = randInt(20,150);
  updateChart();
}, 20000);