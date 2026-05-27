const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "my-vehicle-464eb.firebaseapp.com",
  projectId: "my-vehicle-464eb"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const monthNames=[
"January","February","March","April","May","June",
"July","August","September","October","November","December"
];

document.getElementById("monthName").innerHTML=
monthNames[new Date().getMonth()] + " " + new Date().getFullYear();

function formatDate(d){
  let p=d.split("-");
  return p[2]+"/"+p[1]+"/"+p[0];
}

function showSection(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function addData(){

if(!date.value||!driver.value||!start.value||!end.value){
  alert("Fill all fields");
  return;
}

let km=end.value-start.value;
let rate=km<=40?10:8;
let total=km*rate;

let d=new Date(date.value);
let month=d.getMonth()+1;
let year=d.getFullYear();

 db.collection("vehicles").add({
  date:formatDate(date.value),
  rawDate:date.value,
  driver:driver.value,
  totalKM:Number(km),
  rate,
  totalAmount:total,
  diesel:Number(diesel.value)||0,
  paid:Number(paid.value)||0,
  month,
  year
 });

 document.querySelectorAll('#vehicleSection input').forEach(i=>i.value='');
}

function addMaintenance(){

if(!mDate.value||!mDriver.value||!mWork.value||!mAmount.value){
  alert("Fill all fields");
  return;
}

let d=new Date(mDate.value);
let month=d.getMonth()+1;
let year=d.getFullYear();

 db.collection("maintenance").add({
  date:formatDate(mDate.value),
  rawDate:mDate.value,
  driver:mDriver.value,
  work:mWork.value,
  amount:Number(mAmount.value),
  month,
  year
 });

 document.querySelectorAll('#maintenanceSection input').forEach(i=>i.value='');
}

function editData(id,e){

 let paid=prompt("Paid",e.paid);
 let diesel=prompt("Diesel",e.diesel);

 db.collection("vehicles").doc(id).update({
  paid:Number(paid),
  diesel:Number(diesel)
 });
}

function loadData(){

let currentMonth=new Date().getMonth()+1;
let currentYear=new Date().getFullYear();

let vehicles=[];
let maintenance=[];

db.collection("vehicles")
.onSnapshot(snapshot=>{

vehicles=[];

snapshot.forEach(doc=>{
let e=doc.data();
e.id=doc.id;

/* OLD ENTRIES FIX */
if(!e.month || !e.year){

if(e.rawDate){

let d=new Date(e.rawDate);

e.month=d.getMonth()+1;
e.year=d.getFullYear();

db.collection("vehicles").doc(doc.id).update({
month:e.month,
year:e.year
});

}

}

vehicles.push(e);
});

render();
});

db.collection("maintenance")
.onSnapshot(snapshot=>{

maintenance=[];

snapshot.forEach(doc=>{

let m=doc.data();

/* OLD MAINTENANCE FIX */
if(!m.month || !m.year){

if(m.rawDate){

let d=new Date(m.rawDate);

m.month=d.getMonth()+1;
m.year=d.getFullYear();

db.collection("maintenance").doc(doc.id).update({
month:m.month,
year:m.year
});

}

}

maintenance.push(m);
});

render();
});

function render(){

tableBody.innerHTML="";
maintenanceBody.innerHTML="";
historyBox.innerHTML="";

let totalExtra=0;
let totalSaving=0;
let totalMaintenance=0;
let totalKMRun=0;

let currentVehicles=vehicles.filter(v=>
v.month===currentMonth && v.year===currentYear
);

currentVehicles.sort((a,b)=>new Date(a.rawDate)-new Date(b.rawDate));

currentVehicles.forEach(e=>{

totalKMRun+=e.totalKM||0;

let extra=e.totalAmount-(e.paid||0);
let save=(e.paid||0)-(e.diesel||0);

totalExtra+=extra;
totalSaving+=save;

tableBody.innerHTML+=`
<tr>
<td>${e.date}</td>
<td>${e.driver}</td>
<td>${e.totalKM}</td>
<td>${e.totalAmount}</td>
<td>${e.paid}</td>
<td>
<button class="edit-btn"
onclick='editData("${e.id}",${JSON.stringify(e)})'>
✏
</button>
</td>
</tr>`;
});

let currentMaintenance=maintenance.filter(m=>
m.month===currentMonth && m.year===currentYear
);

currentMaintenance.forEach(m=>{

totalMaintenance+=m.amount||0;

maintenanceBody.innerHTML+=`
<tr>
<td>${m.date}</td>
<td>${m.work}</td>
<td>₹${m.amount}</td>
</tr>`;
});

extraText.innerHTML='₹'+Math.abs(totalExtra);
savingText.innerHTML='₹'+totalSaving;
maintenanceText.innerHTML='₹'+totalMaintenance;
finalText.innerHTML='₹'+(totalSaving-totalMaintenance);
document.getElementById("totalKM").innerHTML=totalKMRun;

let groups={};

vehicles.forEach(v=>{

let key=v.month+'-'+v.year;

if(!groups[key]){

groups[key]={
month:v.month,
year:v.year,
total:0,
km:0
};

}

groups[key].total+=v.totalAmount||0;
groups[key].km+=v.totalKM||0;

});

Object.values(groups).forEach(g=>{

historyBox.innerHTML+=`
<div class="history-card">
<h3>${monthNames[g.month-1]} ${g.year}</h3>
<p>Total KM: ${g.km}</p>
<p>Total Amount: ₹${g.total}</p>
</div>`;
});

}
}

loadData();

setTimeout(()=>{
 document.getElementById('splash').style.display='none';
},1200);