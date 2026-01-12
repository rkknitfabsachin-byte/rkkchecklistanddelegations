const API="https://checklist-art-f8d8.rkknitfabsachin.workers.dev";
const token=localStorage.getItem("auth_token");

async function load(){
  const r=await fetch(API+"/tasks",{headers:{Authorization:"Bearer "+token}});
  const j=await r.json();
  const d=j.data;

  render([...d.missed,...d.today,...d.delegation],"tasks");
  document.getElementById("todayDone").innerText = d.today.length;
  document.getElementById("weekDone").innerText = d.today.length + d.missed.length;

  document.getElementById("bar").style.width =
    Math.min(100, (d.today.length*10))+"%";
}

function render(arr,id){
  const el=document.getElementById(id);
  el.innerHTML="";
  arr.forEach(t=>{
    const div=document.createElement("div");
    div.className="task";
    div.innerHTML=`<div><b>${t.task}</b><br><small>${t.date} • ${t.source}</small></div>
    <button onclick='done(${JSON.stringify(t)})'>Done</button>`;
    el.appendChild(div);
  });
}

async function done(t){
  await fetch(API+"/tasks/complete",{
    method:"POST",
    headers:{
      Authorization:"Bearer "+token,
      "Content-Type":"application/json"
    },
    body:JSON.stringify(t)
  });
  load();
}

load();
