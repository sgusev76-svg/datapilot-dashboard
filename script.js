// ========= Метрики (анимация чисел) =========
function animateNumber(el, start, end, duration = 800, prefix = "$") {
  let startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    const value = Math.floor(start + (end - start) * progress);
    el.textContent = el.dataset.label + ": " + prefix + value;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ========= Toast уведомления =========
function showToast(message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(()=> toast.remove(), 4000);
}

// ========= Рекомендации + localStorage =========
const cards = document.querySelectorAll(".card");
const bannerTitle = document.getElementById("banner-title");
const state = JSON.parse(localStorage.getItem("recsState")) || {};
function updateCard(card, status) {
  card.classList.remove("accepted","declined");
  if (status) card.classList.add(status);
  state[card.dataset.id] = status;
  localStorage.setItem("recsState", JSON.stringify(state));
  updateBanner();
  if (status==="accepted") showToast("Рекомендация принята ✅");
  if (status==="declined") showToast("Рекомендация отклонена ❌");
}
function updateBanner() {
  let acc = Object.values(state).filter(s=>s==="accepted").length;
  let dec = Object.values(state).filter(s=>s==="declined").length;
  bannerTitle.textContent = `Обработано ${acc+dec}/${cards.length} рекомендаций (${acc} принято, ${dec} отклонено)`;
}
cards.forEach(c=>{
  const id=c.dataset.id;
  if(state[id]) updateCard(c,state[id]);
  c.querySelector(".btn-accept").onclick=()=>updateCard(c,"accepted");
  c.querySelector(".btn-decline").onclick=()=>updateCard(c,"declined");
  c.querySelector(".btn-details").onclick=()=>{
    document.getElementById("modal").style.display="block";
    document.getElementById("modal-title").textContent = c.querySelector("h3").textContent;
    document.getElementById("modal-text").textContent = c.querySelector("p").textContent;
  };
});
updateBanner();

// ========= Модалка =========
document.querySelector(".modal-close").onclick=()=>document.getElementById("modal").style.display="none";
window.onclick=(e)=>{ if(e.target===document.getElementById("modal")) document.getElementById("modal").style.display="none"; }

// ========= Chart.js =========
const colors={blue:"#2563EB",green:"#10B981",orange:"#F59E0B",red:"#EF4444"};
const revenueChart=new Chart(document.getElementById("revenueChart"),{
  type:"line", data:{ labels:["Пн","Вт","Ср","Чт","Пт","Сб","Вс"],
    datasets:[{data:[4200,4800,5000,5300,5500,6000,5900],borderColor:colors.blue,
      backgroundColor:"rgba(37,99,235,0.2)",fill:true,tension:0.3}]},
  options:{plugins:{legend:{display:false}}}
});
const avgCheckChart=new Chart(document.getElementById("avgCheckChart"),{
  type:"bar",data:{labels:["Неделя1","Неделя2","Неделя3","Неделя4"],
    datasets:[{data:[70,72,75,78],backgroundColor:colors.green}]},
  options:{plugins:{legend:{display:false}}}
});
const cacChart=new Chart(document.getElementById("cacChart"),{
  type:"doughnut",data:{labels:["Реклама","PR","SMM"],
    datasets:[{data:[30,15,5],backgroundColor:[colors.red,colors.orange,colors.blue]}]}
});

// ========= Живое обновление =========
const revenueMetric=document.getElementById("revenueMetric");
const avgCheckMetric=document.getElementById("avgCheckMetric");
const cacMetric=document.getElementById("cacMetric");
revenueMetric.dataset.label="Выручка"; avgCheckMetric.dataset.label="Средний чек"; cacMetric.dataset.label="CAC";
let cur={rev:5000,avg:75,cac:50};
function updateLive() {
  // revenue
  let newRev=revenueChart.data.datasets[0].data.map(v=>v+Math.round((Math.random()-0.5)*200));
  revenueChart.data.datasets[0].data=newRev; revenueChart.update();
  let avgRev=Math.round(newRev.reduce((a,b)=>a+b)/newRev.length);
  animateNumber(revenueMetric,cur.rev,avgRev,800,"$"); cur.rev=avgRev;
  // avgCheck
  let newAvg=avgCheckChart.data.datasets[0].data.map(v=>v+Math.round((Math.random()-0.5)*3));
  avgCheckChart.data.datasets[0].data=newAvg; avgCheckChart.update();
  let avgChk=Math.round(newAvg.reduce((a,b)=>a+b)/newAvg.length);
  animateNumber(avgCheckMetric,cur.avg,avgChk,800,"$"); cur.avg=avgChk;
  // CAC
  let newCac=cacChart.data.datasets[0].data.map(v=>Math.max(5,v+Math.round((Math.random()-0.5)*5)));
  cacChart.data.datasets[0].data=newCac; cacChart.update();
  let avgCac=Math.round(newCac.reduce((a,b)=>a+b)/newCac.length);
  animateNumber(cacMetric,cur.cac,avgCac,800,"$"); cur.cac=avgCac;
}
setInterval(updateLive,5000);
