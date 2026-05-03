import React, { useState, useEffect, useRef } from "react";

// hooks imported above

const DB_URL = "https://vietnam-trip-2026-77db0-default-rtdb.europe-west1.firebasedatabase.app";
const ADMIN_PASS = "tokishi1tokishi1";

const USERS = [
  { id: "nir",   name: "ניר",           icon: "👨", admin: true,  canEdit: true  },
  { id: "inbal", name: "ענבל חן",        icon: "👩", admin: false, canEdit: true  },
  { id: "gili",  name: "גילי חן אזולאי", icon: "👧", admin: false, canEdit: true  },
  { id: "guest", name: "אורח",           icon: "🧳", admin: false, canEdit: false },
];

const T = {
  teal:"#2A6B5E",tealDk:"#1B4D45",tealLt:"#E8F4F1",tealMd:"#3D8C7A",
  sand:"#F7F4EF",white:"#fff",
  g50:"#F9F9F7",g100:"#F3F4F6",g200:"#E5E7EB",g300:"#D1D5DB",
  g400:"#9CA3AF",g500:"#6B7280",g600:"#4B5563",g700:"#374151",g900:"#111827",
  red:"#DC2626",amber:"#D97706",green:"#059669",blue:"#2563EB",
};

const fb = {
  get:   async p    => { try{const r=await fetch(`${DB_URL}/${p}.json`);return r.json();}catch{return null;} },
  set:   async (p,d)=> fetch(`${DB_URL}/${p}.json`,{method:"PUT",body:JSON.stringify(d)}),
  patch: async (p,d)=> fetch(`${DB_URL}/${p}.json`,{method:"PATCH",body:JSON.stringify(d)}),
  del:   async p    => fetch(`${DB_URL}/${p}.json`,{method:"DELETE"}),
  listen:(p,cb)=>{
    let last=null;
    const poll=async()=>{
      try{
        const r=await fetch(`${DB_URL}/${p}.json`);
        const d=await r.json();
        const key=JSON.stringify(d);
        if(key!==last){last=key;cb(d);}
      }catch{}
    };
    poll();
    const id=setInterval(poll,3000);
    return ()=>clearInterval(id);
  },
};

const DEF_STOPS=[
  {id:"s1",city:"האנוי",eng:"Hanoi",icon:"🏮",color:"#C53030",dateIn:"2026-09-04",dateOut:"2026-09-08",nights:3,notes:"",flag:"🇻🇳",tagline:"בירת הצפון — עיר שלא נרדמת",about:"האנוי יושבת בצפון וייטנאם על גדות נהר ההונג. אחת הערים העתיקות בדרום מזרח אסיה עם יותר מאלף שנות היסטוריה. אווירה של קולוניאליזם צרפתי לצד תרבות וייטנאמית עתיקה — בנייה ישנה, קפה על המדרכה, עשן אגרבת מהמקדשים. צפוף, רועש ומרתק.",chips:["צפון וייטנאם","בירת המדינה","10 מיליון תושבים","אוכל רחוב מהטוב בעולם"],
   weather:"🌡️ 31–33°C · לח מאוד · גשמי צהריים קצרים",weatherTip:"צאו לסיורים בבוקר מוקדם (7–11) לפני החום והגשם. קחו מטריה קלה — היא תציל אתכם."},
  {id:"s2",city:"הוי אן",eng:"Hoi An",icon:"🏮",color:"#B7791F",dateIn:"2026-09-08",dateOut:"2026-09-12",nights:4,notes:"",flag:"🇻🇳",tagline:"עיר הפנסים — כאילו עצר הזמן",about:"הוי אן שוכנת במרכז וייטנאם על נהר Thu Bon, כ-30 ק\"מ מדא נאנג. העיר העתיקה שמורה כמעט בשלמותה מהמאות 15–19 ומוכרת כאתר UNESCO. פורט מסחר בינלאומי בעברה — מכאן השפעות יפניות, סיניות ואירופאיות בארכיטקטורה. בלילה מואר בפנסי נייר צבעוניים.",chips:["מרכז וייטנאם","UNESCO World Heritage","30 ק\"מ מדא נאנג","חייטים + אוכל + חוף"],
   weather:"🌡️ 29–32°C · ים לפעמים סוער · גשם אחה"צ",weatherTip:"חוף An Bang בבוקר — אחה"צ לפעמים גלים. העיר העתיקה יפה גם בגשם — פנסים על המים."},
  {id:"s3",city:"חו צ'י מין",eng:"HCMC",icon:"🏙️",color:"#6B46C1",dateIn:"2026-09-11",dateOut:"2026-09-13",nights:2,notes:"",flag:"🇻🇳",tagline:"מטרופולין הדרום — אנרגיה שלא נעצרת",about:"חו צ'י מין סיטי, הידועה בשמה הישן סייגון, היא העיר הגדולה בוייטנאם עם כ-13 מיליון תושב. שוכנת בדרום המדינה. שונה לחלוטין מהאנוי — מהירה, מודרנית, קפיטליסטית. District 1 הוא הלב הפועם עם ניגוד חד בין בניינים קולוניאליים לגורדי שחקים חדשים.",chips:["דרום וייטנאם","לשעבר סייגון","13 מיליון תושבים","Cu Chi — 40 ק\"מ"],
   weather:"🌡️ 30–33°C · לח · גשמי ערב קצרים",weatherTip:"Cu Chi בבוקר מוקדם לפני החום. הגשם בערב קצר ומרענן — לא מפריע לסיורי לילה."},
  {id:"s4",city:"פו קווק",eng:"Phu Quoc",icon:"🏖️",color:"#2B6CB0",dateIn:"2026-09-13",dateOut:"2026-09-17",nights:4,notes:"",flag:"🇻🇳",tagline:"אי הפנינה — וייטנאם על החוף",about:"פו קווק הוא האי הגדול ביותר של וייטנאם, ממוקם במפרץ תאילנד ליד גבול קמבודיה. עד לפני כ-15 שנה היה כפר דייגים נשכח — היום הוא יעד תיירות מתפתח עם חופים בין היפים בדרום מזרח אסיה. המים שקופים ורדודים, הסנרקלינג מצוין.",chips:["מפרץ תאילנד","דרום מערב וייטנאם","האי הגדול בוייטנאם","חופים טורקיז"],
   weather:"🌡️ 28–31°C · הכי יציב במסלול · לפעמים גלים",weatherTip:"פו קווק הכי פחות מושפע מהמוסון. Sao Beach בבוקר — המים הכי שקטים. בדקו תנאי ים לפני סנורקלינג."},
  {id:"s5",city:"בנקוק",eng:"Bangkok",icon:"🛕",color:"#975A16",dateIn:"2026-09-17",dateOut:"2026-09-22",nights:5,notes:"",flag:"🇹🇭",tagline:"בירת תאילנד — כאוס יפהפה",about:"בנקוק היא בירת תאילנד ואחת הערים התיירותיות ביותר בעולם. שוכנת על נהר Chao Phraya. ניגוד מוחלט: מקדשי זהב ליד מרכזי קניות ענקיים, אוכל רחוב ב-50 באט ליד מסעדות מישלן. בלילה מתעוררת לחלוטין — אחת הערים הכי שוות לאוכל בעולם.",chips:["בירת תאילנד","נהר Chao Phraya","10 מיליון תושבים","שוק + ספא + מקדשים"],
   weather:"🌡️ 30–33°C · לח · גשמי צהריים",weatherTip:"מקדשים בבוקר מוקדם לפני החום. שווקים ואוכל רחוב — עיקר הכיף בלילה כשמתקרר."},
];
const DEF_FLIGHTS=[
  {id:"f1",from:"TLV",to:"BKK",date:"2026-09-04",time:"07:00",airline:"Thai Airways",num:"TG084",price:180,status:"confirmed",notes:"עצירה בבנקוק"},
  {id:"f2",from:"BKK",to:"HAN",date:"2026-09-04",time:"19:00",airline:"Thai Airways",num:"TG684",price:180,status:"confirmed",notes:"מגיעים ~21:30"},
  {id:"f3",from:"HAN",to:"DAD",date:"2026-09-08",time:"06:30",airline:"VietJet",num:"VJ138",price:35,status:"planned",notes:"דא נאנג → הוי אן ברכב"},
  {id:"f4",from:"DAD",to:"SGN",date:"2026-09-12",time:"09:00",airline:"Bamboo",num:"QH201",price:40,status:"planned",notes:""},
  {id:"f5",from:"SGN",to:"PQC",date:"2026-09-13",time:"14:00",airline:"VietJet",num:"VJ185",price:25,status:"planned",notes:""},
  {id:"f6",from:"PQC",to:"BKK",date:"2026-09-17",time:"17:00",airline:"Bangkok Airways",num:"PG741",price:90,status:"planned",notes:"ישיר!"},
  {id:"f7",from:"BKK",to:"TLV",date:"2026-09-22",time:"23:30",airline:"Thai Airways",num:"TG085",price:180,status:"confirmed",notes:"טיסת לילה"},
];
const DEF_STAYS=[
  {id:"h1",stopId:"s1",name:"Airbnb — Old Quarter",type:"airbnb",address:"Old Quarter, Hanoi",checkIn:"2026-09-04",checkOut:"2026-09-08",price:70,perNight:true,booked:false,link:"",notes:"מרפסת + מטבח"},
  {id:"h2",stopId:"s2",name:"Airbnb — וילה עם בריכה",type:"airbnb",address:"Cam Nam, Hoi An",checkIn:"2026-09-08",checkOut:"2026-09-12",price:120,perNight:true,booked:false,link:"",notes:"בריכה פרטית"},
  {id:"h3",stopId:"s3",name:"מלון בוטיק District 1",type:"hotel",address:"District 1, HCMC",checkIn:"2026-09-11",checkOut:"2026-09-13",price:85,perNight:true,booked:false,link:"",notes:""},
  {id:"h4",stopId:"s4",name:"Salinda Resort",type:"resort",address:"Long Beach, Phu Quoc",checkIn:"2026-09-13",checkOut:"2026-09-17",price:130,perNight:true,booked:false,link:"",notes:"בריכת אינפיניטי"},
  {id:"h5",stopId:"s5",name:"מלון — Sukhumvit",type:"hotel",address:"Sukhumvit, Bangkok",checkIn:"2026-09-17",checkOut:"2026-09-22",price:80,perNight:true,booked:false,link:"",notes:""},
];

const STAY_TYPES={airbnb:{label:"Airbnb",icon:"🏠",bg:"#FFF5F0",border:"#FECDB0",color:"#C2410C"},hotel:{label:"מלון",icon:"🏨",bg:"#F0F6FF",border:"#BFDBFE",color:"#1E40AF"},resort:{label:"ריזורט",icon:"🏖️",bg:"#F0FBF6",border:"#A7F3D0",color:"#065F46"},hostel:{label:"הוסטל",icon:"🛏️",bg:"#F5F3FF",border:"#DDD6FE",color:"#5B21B6"}};
const FL_STATUS={confirmed:{bg:"#D1FAE5",color:"#065F46",label:"מאושר ✓"},planned:{bg:"#FEF3C7",color:"#92400E",label:"מתוכנן"},wishlist:{bg:"#EDE9FE",color:"#5B21B6",label:"רצוי"}};

const fmtDate=d=>{if(!d)return"";const[,m,day]=d.split("-");return `${day}.${m}`;};
const uid=()=>"x"+Math.random().toString(36).slice(2,9);
const nts=(a,b)=>{try{return Math.round((new Date(b)-new Date(a))/864e5);}catch{return 0;}};

const Card=({children,style={}})=><div style={{background:T.white,borderRadius:14,boxShadow:"0 2px 12px rgba(0,0,0,.07)",border:`1px solid ${T.g200}`,...style}}>{children}</div>;
const Lbl=({c})=><div style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:T.g400,marginBottom:8}}>{c}</div>;
const Btn=({children,onClick,v="primary",sm,style={}})=>{
  const vs={primary:{background:T.teal,color:"#fff"},ghost:{background:T.g100,color:T.g700},danger:{background:"#FEE2E2",color:T.red},teal:{background:T.tealLt,color:T.tealDk}}[v]||{};
  return <button onClick={onClick} style={{...vs,border:"none",borderRadius:8,fontFamily:"inherit",cursor:"pointer",fontWeight:600,padding:sm?"5px 11px":"9px 17px",fontSize:sm?12:14,...style}}>{children}</button>;
};
const Inp=({label,value,onChange,type="text",ph=""})=>(
  <div style={{marginBottom:10}}>
    {label&&<div style={{fontSize:11,fontWeight:600,color:T.g600,marginBottom:3}}>{label}</div>}
    <input value={value||""} onChange={e=>onChange(e.target.value)} type={type} placeholder={ph}
      style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1px solid ${T.g300}`,fontSize:13,fontFamily:"inherit",color:T.g900,outline:"none",background:T.white}}/>
  </div>
);
const Sel=({label,value,onChange,options})=>(
  <div style={{marginBottom:10}}>
    {label&&<div style={{fontSize:11,fontWeight:600,color:T.g600,marginBottom:3}}>{label}</div>}
    <select value={value||""} onChange={e=>onChange(e.target.value)}
      style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1px solid ${T.g300}`,fontSize:13,fontFamily:"inherit",color:T.g900,outline:"none",background:T.white}}>
      {options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
);

function Modal({title,onClose,children}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:T.white,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:640,maxHeight:"88vh",overflowY:"auto",padding:"20px 18px 36px"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <span style={{fontSize:16,fontWeight:700,color:T.g900}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:T.g400}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoginScreen({onLogin}){
  const [step,setStep]=useState("pick");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [showPas,setShowPas]=useState(false);
  const pickUser=u=>{if(u.admin){setStep("pass");return;}onLogin(u);};
  const submitPass=()=>{if(pass===ADMIN_PASS){onLogin(USERS[0]);setErr("");}else{setErr("סיסמה שגויה");setPass("");}};
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${T.tealDk},${T.teal} 55%,${T.tealMd})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,direction:"rtl"}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:52,fontWeight:900,color:"#fff",lineHeight:.9,textAlign:"center",marginBottom:6}}>Vietnam</div>
      <div style={{fontSize:16,color:"rgba(255,255,255,.6)",marginBottom:6}}>&amp; Bangkok</div>
      <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginBottom:40}}>4 – 22 ספטמבר 2026</div>
      {step==="pick"&&(
        <div style={{background:"rgba(255,255,255,.1)",backdropFilter:"blur(12px)",borderRadius:20,padding:28,width:"100%",maxWidth:340,border:"1px solid rgba(255,255,255,.15)"}}>
          <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.7)",marginBottom:18,textAlign:"center"}}>מי אתה?</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {USERS.map(u=>(
              <button key={u.id} onClick={()=>pickUser(u)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",borderRadius:12,background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",cursor:"pointer",fontFamily:"inherit",color:"#fff",textAlign:"right",width:"100%"}}>
                <span style={{fontSize:24}}>{u.icon}</span>
                <div>
                  <div style={{fontSize:15,fontWeight:600,color:"#fff"}}>{u.name}</div>
                  {u.admin&&<div style={{fontSize:10,color:"rgba(255,255,255,.5)",marginTop:1}}>מנהל הטיול</div>}
                </div>
                <span style={{marginRight:"auto",color:"rgba(255,255,255,.4)",fontSize:18}}>›</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {step==="pass"&&(
        <div style={{background:"rgba(255,255,255,.1)",backdropFilter:"blur(12px)",borderRadius:20,padding:28,width:"100%",maxWidth:340,border:"1px solid rgba(255,255,255,.15)"}}>
          <button onClick={()=>{setStep("pick");setPass("");setErr("");}} style={{background:"none",border:"none",color:"rgba(255,255,255,.5)",cursor:"pointer",fontSize:13,marginBottom:16,padding:0,fontFamily:"inherit"}}>← חזרה</button>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:28}}>👨</div>
            <div style={{fontSize:16,fontWeight:700,color:"#fff",marginTop:4}}>ניר</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>הכנס קוד מנהל</div>
          </div>
          <div style={{position:"relative",marginBottom:8}}>
            <input value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitPass()}
              type={showPas?"text":"password"} placeholder="••••••••"
              style={{width:"100%",padding:"12px 44px 12px 16px",borderRadius:10,border:`1px solid ${err?"#F87171":"rgba(255,255,255,.3)"}`,background:"rgba(255,255,255,.15)",fontSize:16,fontFamily:"inherit",color:"#fff",outline:"none",textAlign:"center",letterSpacing:showPas?1:4}}/>
            <button onClick={()=>setShowPas(p=>!p)} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,.6)",fontSize:18,lineHeight:1,padding:2}}>
              {showPas?"🙈":"👁️"}
            </button>
          </div>
          {err&&<div style={{fontSize:12,color:"#FCA5A5",textAlign:"center",marginBottom:8}}>{err}</div>}
          <button onClick={submitPass} style={{width:"100%",padding:"12px",borderRadius:10,background:T.teal,color:"#fff",border:"none",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>כניסה</button>
        </div>
      )}
    </div>
  );
}

function FlightForm({init={},onSave,onClose}){
  const [f,setF]=useState({from:"",to:"",date:"",time:"",airline:"",num:"",price:"",status:"planned",notes:"",...init});
  const s=k=>v=>setF(p=>({...p,[k]:v}));
  return <>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 10px"}}>
      <Inp label="מוצא" value={f.from} onChange={s("from")} ph="TLV"/>
      <Inp label="יעד" value={f.to} onChange={s("to")} ph="HAN"/>
      <Inp label="תאריך" value={f.date} onChange={s("date")} type="date"/>
      <Inp label="שעה" value={f.time} onChange={s("time")} type="time"/>
      <Inp label="חברת תעופה" value={f.airline} onChange={s("airline")} ph="VietJet"/>
      <Inp label="מס' טיסה" value={f.num} onChange={s("num")} ph="VJ138"/>
      <Inp label="מחיר $/אדם" value={f.price} onChange={s("price")} type="number" ph="35"/>
    </div>
    <Sel label="סטטוס" value={f.status} onChange={s("status")} options={[{v:"confirmed",l:"✓ מאושר"},{v:"planned",l:"מתוכנן"},{v:"wishlist",l:"רצוי"}]}/>
    <div style={{marginBottom:12}}>
      <div style={{fontSize:11,fontWeight:600,color:T.g600,marginBottom:3}}>הערות</div>
      <textarea value={f.notes||""} onChange={e=>setF(p=>({...p,notes:e.target.value}))} style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1px solid ${T.g300}`,fontSize:13,fontFamily:"inherit",resize:"none",minHeight:52,color:T.g900}}/>
    </div>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
      <Btn v="ghost" onClick={onClose}>ביטול</Btn>
      <Btn onClick={()=>onSave(f)}>שמור</Btn>
    </div>
  </>;
}

function StayForm({init={},stops,onSave,onClose}){
  const [s,setS]=useState({stopId:stops[0]?.id||"s1",name:"",type:"airbnb",address:"",checkIn:"",checkOut:"",price:"",perNight:true,booked:false,link:"",notes:"",...init});
  const set=k=>v=>setS(p=>({...p,[k]:v}));
  return <>
    <Sel label="עצירה" value={String(s.stopId)} onChange={set("stopId")} options={stops.map(st=>({v:st.id,l:`${st.icon} ${st.city}`}))}/>
    <Inp label="שם המקום" value={s.name} onChange={set("name")} ph="Salinda Resort"/>
    <Sel label="סוג" value={s.type} onChange={set("type")} options={Object.entries(STAY_TYPES).map(([k,v])=>({v:k,l:`${v.icon} ${v.label}`}))}/>
    <Inp label="כתובת / אזור" value={s.address} onChange={set("address")} ph="Long Beach, Phu Quoc"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 10px"}}>
      <Inp label="צ'ק אין" value={s.checkIn} onChange={set("checkIn")} type="date"/>
      <Inp label="צ'ק אאוט" value={s.checkOut} onChange={set("checkOut")} type="date"/>
      <Inp label="מחיר $" value={s.price} onChange={set("price")} type="number" ph="120"/>
    </div>
    <div style={{display:"flex",gap:20,marginBottom:10}}>
      {[["perNight","מחיר ללילה"],["booked","הוזמן ✓"]].map(([k,l])=>(
        <label key={k} style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:T.g600,cursor:"pointer"}}>
          <input type="checkbox" checked={!!s[k]} onChange={e=>setS(p=>({...p,[k]:e.target.checked}))} style={{accentColor:T.teal}}/>{l}
        </label>
      ))}
    </div>
    <Inp label="קישור הזמנה" value={s.link} onChange={set("link")} ph="https://airbnb.com/..."/>
    <div style={{marginBottom:12}}>
      <div style={{fontSize:11,fontWeight:600,color:T.g600,marginBottom:3}}>הערות</div>
      <textarea value={s.notes||""} onChange={e=>setS(p=>({...p,notes:e.target.value}))} style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1px solid ${T.g300}`,fontSize:13,fontFamily:"inherit",resize:"none",minHeight:52,color:T.g900}}/>
    </div>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
      <Btn v="ghost" onClick={onClose}>ביטול</Btn>
      <Btn onClick={()=>onSave(s)}>שמור</Btn>
    </div>
  </>;
}

const ICONS = ["🏮","🏙️","🏖️","🛕","🌿","🏔️","🎡","🍜","🌊","🗺️","✈️","🎭"];
const COLORS = ["#C53030","#B7791F","#6B46C1","#2B6CB0","#975A16","#0D9488","#1A56DB","#7E3AF2","#E53E3E","#065F46","#92400E","#374151"];

function StopForm({init,onSave,onClose,onDelete}){
  const [s,setS]=useState({nights:0,...init});
  const calcNights = (a,b)=>{ try{return Math.max(0,Math.round((new Date(b)-new Date(a))/864e5));}catch{return s.nights||0;} };
  const set=k=>v=>{
    const upd={...s,[k]:v};
    if(k==="dateIn"||k==="dateOut") upd.nights=calcNights(upd.dateIn,upd.dateOut);
    setS(upd);
  };
  return <>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 10px"}}>
      <Inp label="שם העיר (עברית)" value={s.city} onChange={set("city")} ph="הוי אן"/>
      <Inp label="שם באנגלית" value={s.eng} onChange={set("eng")} ph="Hoi An"/>
      <Inp label="תאריך כניסה" value={s.dateIn} onChange={set("dateIn")} type="date"/>
      <Inp label="תאריך יציאה" value={s.dateOut} onChange={set("dateOut")} type="date"/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 10px",marginBottom:10}}>
      <div>
        <div style={{fontSize:11,fontWeight:600,color:T.g600,marginBottom:3}}>מספר לילות</div>
        <input value={s.nights||""} onChange={e=>setS(p=>({...p,nights:+e.target.value||0}))} type="number" min="0" max="30"
          style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1px solid ${T.g300}`,fontSize:13,fontFamily:"inherit",color:T.g900,outline:"none",background:"white"}}/>
      </div>
      <div style={{display:"flex",alignItems:"flex-end",paddingBottom:2}}>
        <div style={{fontSize:11,color:T.g400,padding:"9px 0"}}>מחושב מתאריכים: <strong style={{color:T.teal}}>{calcNights(s.dateIn,s.dateOut)}</strong></div>
      </div>
    </div>
    <div style={{marginBottom:10}}>
      <div style={{fontSize:11,fontWeight:600,color:T.g600,marginBottom:6}}>אייקון</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {ICONS.map(ic=><button key={ic} onClick={()=>set("icon")(ic)} style={{fontSize:20,padding:"4px 8px",borderRadius:8,border:`2px solid ${s.icon===ic?T.teal:T.g200}`,background:s.icon===ic?T.tealLt:"white",cursor:"pointer"}}>{ic}</button>)}
      </div>
    </div>
    <div style={{marginBottom:10}}>
      <div style={{fontSize:11,fontWeight:600,color:T.g600,marginBottom:6}}>צבע</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {COLORS.map(c=><button key={c} onClick={()=>set("color")(c)} style={{width:28,height:28,borderRadius:"50%",background:c,border:`3px solid ${s.color===c?"#111":"transparent"}`,cursor:"pointer"}}/>)}
      </div>
    </div>
    <div style={{marginBottom:10}}>
      <div style={{fontSize:11,fontWeight:600,color:T.g600,marginBottom:3}}>רקע על המקום</div>
      <textarea value={s.about||""} onChange={e=>setS(p=>({...p,about:e.target.value}))} placeholder="תיאור קצר של המקום — היסטוריה, אווירה, מה מיוחד בו..."
        style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1px solid ${T.g300}`,fontSize:13,fontFamily:"inherit",resize:"none",minHeight:80,color:T.g900}}/>
    </div>
    <div style={{marginBottom:10}}>
      <div style={{fontSize:11,fontWeight:600,color:T.g600,marginBottom:3}}>ניסוח קצר (tagline)</div>
      <input value={s.tagline||""} onChange={e=>setS(p=>({...p,tagline:e.target.value}))} placeholder="בירת הצפון — עיר שלא נרדמת"
        style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1px solid ${T.g300}`,fontSize:13,fontFamily:"inherit",color:T.g900,outline:"none",background:"white"}}/>
    </div>
    <div style={{marginBottom:12}}>
      <div style={{fontSize:11,fontWeight:600,color:T.g600,marginBottom:3}}>הערות</div>
      <textarea value={s.notes||""} onChange={e=>setS(p=>({...p,notes:e.target.value}))} placeholder="דברים לזכור, טיפים..."
        style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1px solid ${T.g300}`,fontSize:13,fontFamily:"inherit",resize:"none",minHeight:60,color:T.g900}}/>
    </div>
    <div style={{display:"flex",gap:8,justifyContent:"space-between",alignItems:"center"}}>
      {onDelete&&<Btn v="danger" onClick={()=>{ if(window.confirm("למחוק עצירה זו לגמרי?")) onDelete(s.id); }}>🗑 מחק עצירה</Btn>}
      <div style={{display:"flex",gap:8,marginRight:"auto"}}>
        <Btn v="ghost" onClick={onClose}>ביטול</Btn>
        <Btn onClick={()=>onSave({...s,nights:s.nights>0?s.nights:calcNights(s.dateIn,s.dateOut)})}>שמור</Btn>
      </div>
    </div>
  </>;
}

function MemberStopForm({init,onSave,onClose}){
  const [notes,setNotes]=useState(init.notes||"");
  return <>
    <div style={{marginBottom:12}}>
      <div style={{fontSize:11,fontWeight:600,color:T.g600,marginBottom:3}}>הערות לעצירה</div>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="מה לעשות, דברים לזכור..."
        style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1px solid ${T.g300}`,fontSize:13,fontFamily:"inherit",resize:"none",minHeight:100,color:T.g900}}/>
    </div>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
      <Btn v="ghost" onClick={onClose}>ביטול</Btn>
      <Btn onClick={()=>onSave({...init,notes})}>שמור</Btn>
    </div>
  </>;
}

function AIChat({stops,flights,stays}){
  const [msgs,setMsgs]=useState([{role:"assistant",content:"שלום! שאל אותי כל שאלה על הטיול 🗺️"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const ref=useRef();
  useEffect(()=>ref.current?.scrollIntoView({behavior:"smooth"}),[msgs]);
  const ctx=`עצירות: ${stops.map(s=>`${s.city}(${fmtDate(s.dateIn)}–${fmtDate(s.dateOut)})`).join("→")}`;
  const send=async()=>{
    if(!input.trim()||loading)return;
    const um={role:"user",content:input.trim()};
    setMsgs(p=>[...p,um]);setInput("");setLoading(true);
    try{
      const res=await fetch("https://vietnam-ai-proxy.azounir.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:600,
          system:`אתה דן — מדריך טיולים ישראלי שחי 8 שנים בווייטנאם ו-4 שנים בתאילנד. אתה מכיר כל רחוב, כל שוק, כל מסעדה שמקומיים אוכלים בה. אתה לא נותן המלצות גנריות מ-TripAdvisor — אתה נותן את מה שבאמת שווה.

הטיול: משפחה ישראלית — אבא (ניר), אמא (ענבל), בת (גילי, 17). תאריכים: 4–22 ספטמבר 2026.
מסלול: האנוי (4–7.9) → הוי אן (7–11.9) → חו צ׳י מין (11–13.9) → פו קווק (13–17.9) → בנקוק (17–22.9).

הסגנון שלך:
- מדבר עברית ישירה, כמו חבר שיצא מהמקלחת ונותן עצה
- נותן שמות ספציפיים: שם המסעדה, שם הרחוב, מה להזמין
- יודע מה מקומיים אוכלים vs מה תיירים אוכלים (ואתה שולח לאוכל המקומי)
- מזהיר מפני מלכודות תיירים בצורה הומוריסטית
- מתחשב שיש בת 17 — נותן גם אטרקציות שמעניינות גיל כזה
- יודע שספטמבר זה עונת מוסון — מתאים המלצות בהתאם
- מכיר את האוכל לעומק: Cao Lau מהוי אן שונה מכל מקום אחר, Bun Bo Hue חריף יותר מ-Pho, Pad Thai ב-Bangkok שונה מהמקור, וכו׳

ידע ספציפי שיש לך:
וייטנאם: Banh Mi 25 בהאנוי (תור ארוך — שווה), Pho Thin להגיע ב-6 בבוקר, Morning Glory בהוי אן של Duc, White Rose רק בהוי אן, Bun Cha Obama בהאנוי, Com Tam Nguyen Van Cu בסייגון, Night Market בפו קווק לדגים טריים.
תאילנד: Pad See Ew > Pad Thai, Jay Fai בבנקוק (מישלן — להזמין מראש), Chatuchak רק בסוף שבוע, Or Tor Kor Market לאוכל מקומי, Chinatown Yaowarat בלילה.
מזג אויר ספטמבר: האנוי — לח ו-32 מעלות, גשמי צהריים; הוי אן — ים לא תמיד רגוע, גשם אחה"צ; HCMC — 30 מעלות, גשמי ערב קצרים; פו קווק — הכי יציב, לפעמים גלים; בנקוק — 32 מעלות, גשמי צהריים.

תן תשובות שמרגישות כמו הודעת WhatsApp ממדריך שמכיר אותך — ספציפי, מעשי, עם personality.`,
          messages:[...[...msgs,um].slice(-6).map(m=>({role:m.role,content:m.role==="user"?`הקשר: ${ctx}\n${m.content}`:m.content}))]})});
      const d=await res.json();
      setMsgs(p=>[...p,{role:"assistant",content:d.content?.map(b=>b.text||"").join("")||"שגיאה"}]);
    }catch{setMsgs(p=>[...p,{role:"assistant",content:"שגיאה. נסה שוב."}]);}
    setLoading(false);
  };
  return(
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 200px)",minHeight:380}}>
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,padding:"4px 0 10px"}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
            {m.role==="assistant"&&<div style={{width:26,height:26,borderRadius:"50%",background:T.teal,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",flexShrink:0,marginTop:2}}>AI</div>}
            <div style={{maxWidth:"88%",padding:"9px 13px",borderRadius:m.role==="user"?"13px 13px 4px 13px":"13px 13px 13px 4px",background:m.role==="user"?T.tealLt:T.white,border:`1px solid ${m.role==="user"?T.tealMd:T.g200}`,fontSize:13,color:T.g700,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{m.content}</div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",gap:8}}><div style={{width:26,height:26,borderRadius:"50%",background:T.teal,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",flexShrink:0}}>AI</div><div style={{padding:"9px 13px",borderRadius:"13px 13px 13px 4px",background:T.white,border:`1px solid ${T.g200}`,fontSize:13,color:T.g400}}>מחשב...</div></div>}
        <div ref={ref}/>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
        {["מה לאכול בהוי אן?","פו קווק עם בת 17?","כמה זמן Cu Chi?","מה לקנות בבנקוק?"].map(q=>(
          <button key={q} onClick={()=>setInput(q)} style={{fontSize:11,padding:"4px 9px",borderRadius:20,background:T.g100,border:`1px solid ${T.g200}`,color:T.g600,cursor:"pointer",fontFamily:"inherit"}}>{q}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="שאל..."
          style={{flex:1,padding:"9px 13px",borderRadius:10,border:`1px solid ${T.g300}`,fontSize:13,fontFamily:"inherit",outline:"none",color:T.g900}}/>
        <Btn onClick={send} style={{borderRadius:10}}>שלח</Btn>
      </div>
    </div>
  );
}

function TimelineTab({stops,flights,stays,isAdmin,canEdit,onEditStop,onEditStay,onAddStay,onDelStop}){
  return(
    <div>
      {stops.map((st,i)=>{
        const ss=stays.filter(s=>s.stopId===st.id);
        const inf=i>0?flights.find(f=>f.date===st.dateIn):null;
        return(
          <div key={st.id}>
            {inf&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0 5px 54px",fontSize:11,color:T.g400}}>
              <span>✈</span><span>{inf.from}→{inf.to} · {inf.airline} · {inf.time}</span>
              <div style={{flex:1,height:1,background:T.g200}}/>
            </div>}
            <div style={{display:"flex",gap:14,position:"relative"}}>
              <div style={{flexShrink:0,width:40,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:4,position:"relative"}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:st.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,boxShadow:"0 2px 8px rgba(0,0,0,.15)",zIndex:1}}>{st.icon}</div>
                {i<stops.length-1&&<div style={{position:"absolute",top:44,bottom:-24,width:2,background:T.g200}}/>}
              </div>
              <div style={{flex:1,paddingBottom:22}}>
                <div style={{display:"flex",alignItems:"center",gap:8,paddingTop:8,marginBottom:2}}>
                  <span style={{fontSize:18,fontWeight:700,color:T.g900}}>{st.city}</span>
                  <span style={{fontSize:11,fontWeight:600,padding:"2px 7px",borderRadius:20,background:T.g100,color:T.g500}}>{st.nights||nts(st.dateIn,st.dateOut)}n</span>
                  {(isAdmin||canEdit)&&<button onClick={()=>onEditStop(st)} style={{marginRight:"auto",fontSize:11,padding:"2px 7px",borderRadius:20,background:"none",border:`1px solid ${T.g200}`,color:T.g500,cursor:"pointer",fontFamily:"inherit"}}>✏️</button>}
                </div>
                <div style={{fontSize:11,color:T.g400,marginBottom:10}}>{fmtDate(st.dateIn)}–{fmtDate(st.dateOut)}</div>
                {st.weather&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:10,background:"#F0F9FF",border:"1px solid #BAE6FD",marginBottom:10}}>
                    <span style={{fontSize:16}}>🌤️</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:"#0369A1"}}>{st.weather}</div>
                      <div style={{fontSize:11,color:"#0284C7",marginTop:2}}>{st.weatherTip}</div>
                    </div>
                  </div>
                )}
                {st.about&&(
                  <div style={{background:T.g50,borderRadius:10,padding:"11px 13px",marginBottom:10,border:`1px solid ${T.g200}`}}>
                    <div style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:8}}>
                      <span style={{fontSize:20,flexShrink:0}}>{st.flag}</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:T.g800,fontStyle:"italic",marginBottom:3}}>{st.tagline}</div>
                        <div style={{fontSize:12,color:T.g600,lineHeight:1.6}}>{st.about}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                      {(st.chips||[]).map(c=><span key={c} style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:T.white,border:`1px solid ${T.g200}`,color:T.g600,fontWeight:500}}>{c}</span>)}
                    </div>
                  </div>
                )}
                {st.notes&&<div style={{fontSize:12,color:T.g600,background:"#FFFBEB",borderRadius:8,padding:"7px 10px",marginBottom:8,lineHeight:1.5,border:"1px solid #FDE68A"}}>{st.notes}</div>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <Lbl c="לינה"/>
                  {(isAdmin||canEdit)&&<button onClick={()=>onAddStay(st.id)} style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:T.tealLt,border:"none",color:T.tealDk,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>+ הוסף</button>}
                </div>
                {ss.length===0&&<div style={{fontSize:12,color:T.g400,fontStyle:"italic"}}>אין לינה מוגדרת</div>}
                {ss.map(stay=>{
                  const stype=STAY_TYPES[stay.type]||STAY_TYPES.hotel;
                  const n=nts(stay.checkIn,stay.checkOut);
                  return(
                    <div key={stay.id} style={{display:"flex",gap:10,padding:"10px 12px",borderRadius:10,background:stype.bg,border:`1px solid ${stype.border}`,marginBottom:8}}>
                      <div style={{fontSize:18,flexShrink:0}}>{stype.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap",marginBottom:2}}>
                          <span style={{fontSize:13,fontWeight:600,color:T.g900}}>{stay.name}</span>
                          {stay.booked&&<span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10,background:"#D1FAE5",color:"#065F46"}}>הוזמן ✓</span>}
                        </div>
                        {stay.address&&<div style={{fontSize:11,color:T.g500,marginBottom:2}}>{stay.address}</div>}
                        {stay.notes&&<div style={{fontSize:11,color:T.g600,lineHeight:1.4,marginBottom:3}}>{stay.notes}</div>}
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          {isAdmin&&<span style={{fontSize:12,fontWeight:600,color:stype.color}}>${stay.price}{stay.perNight?"/לילה":""}</span>}
                          {isAdmin&&n>0&&<span style={{fontSize:11,color:T.g400}}>{n}n=${+stay.price*n}</span>}
                          {(isAdmin||canEdit)&&<button onClick={()=>onEditStay(stay)} style={{marginRight:"auto",fontSize:11,color:T.teal,background:"none",border:"none",cursor:"pointer",padding:0,fontWeight:600}}>עדכן ›</button>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FlightsTab({flights,isAdmin,canEdit,onAdd,onEdit,onDel}){
  const total3=flights.reduce((s,f)=>s+(+f.price||0),0)*3;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.g900}}>כל הטיסות</div>
          {isAdmin&&<div style={{fontSize:12,color:T.g400}}>ל-3: <strong style={{color:T.teal}}>${total3.toLocaleString()}</strong></div>}
        </div>
        {(isAdmin||canEdit)&&<Btn onClick={onAdd} sm>+ טיסה</Btn>}
      </div>
      {[...flights].sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)).map(f=>{
        const st=FL_STATUS[f.status]||FL_STATUS.planned;
        return(
          <Card key={f.id} style={{marginBottom:10}}>
            <div style={{padding:"12px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:16,fontWeight:700}}>{f.from}</span>
                  <span style={{color:T.g400}}>→</span>
                  <span style={{fontSize:16,fontWeight:700}}>{f.to}</span>
                </div>
                <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:10,background:st.bg,color:st.color}}>{st.label}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:4,marginBottom:f.notes?6:0}}>
                {[["תאריך",fmtDate(f.date)],["שעה",f.time],["חברה",f.airline],
                  ...(f.num?[["טיסה",f.num]]:[]),
                  ...(isAdmin?[["$/אדם","$"+f.price],["×3","$"+(+f.price*3).toLocaleString()]]:[[" "," "],[" "," "]]),
                ].map(([l,v],i)=>(
                  <div key={i} style={{fontSize:12}}><span style={{fontSize:10,color:T.g400}}>{l} </span><strong style={{color:l==="×3"?T.teal:T.g700}}>{v}</strong></div>
                ))}
              </div>
              {f.notes&&<div style={{fontSize:12,color:T.g600,background:T.g50,borderRadius:8,padding:"6px 10px",marginBottom:6}}>{f.notes}</div>}
              {(isAdmin||canEdit)&&<div style={{display:"flex",gap:6,justifyContent:"flex-end",paddingTop:8,borderTop:`1px solid ${T.g100}`}}>
                <Btn v="ghost" sm onClick={()=>onEdit(f)}>✏️ ערוך</Btn>
                <Btn v="danger" sm onClick={()=>onDel(f.id)}>מחק</Btn>
              </div>}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function StaysTab({stays,stops,isAdmin,canEdit,onAdd,onEdit,onDel}){
  const total=stays.reduce((s,h)=>{const n=nts(h.checkIn,h.checkOut);return s+(h.perNight?+h.price*n:+h.price)||0;},0);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.g900}}>כל הלינות</div>
          {isAdmin&&<div style={{fontSize:12,color:T.g400}}>סה"כ: <strong style={{color:T.teal}}>${total.toLocaleString()}</strong></div>}
        </div>
        {(isAdmin||canEdit)&&<Btn onClick={()=>onAdd(null)} sm>+ לינה</Btn>}
      </div>
      {stops.map(stop=>{
        const ss=stays.filter(s=>s.stopId===stop.id);
        return(
          <div key={stop.id} style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span>{stop.icon}</span>
              <span style={{fontSize:14,fontWeight:700,color:T.g800}}>{stop.city}</span>
              <span style={{fontSize:11,color:T.g400}}>{fmtDate(stop.dateIn)}–{fmtDate(stop.dateOut)}</span>
            </div>
            {ss.length===0&&(
              (isAdmin||canEdit)
                ?<div onClick={()=>onAdd(stop.id)} style={{padding:"10px",borderRadius:10,background:T.g50,border:`1px dashed ${T.g300}`,fontSize:12,color:T.g400,textAlign:"center",cursor:"pointer"}}>+ הוסף לינה ל{stop.city}</div>
                :<div style={{padding:"10px",borderRadius:10,background:T.g50,fontSize:12,color:T.g400,textAlign:"center"}}>טרם נקבעה לינה</div>
            )}
            {ss.map(stay=>{
              const stype=STAY_TYPES[stay.type]||STAY_TYPES.hotel;
              const n=nts(stay.checkIn,stay.checkOut);
              return(
                <Card key={stay.id} style={{marginBottom:8}}>
                  <div style={{padding:"12px 14px"}}>
                    <div style={{display:"flex",gap:10}}>
                      <div style={{fontSize:20,flexShrink:0}}>{stype.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center",marginBottom:2}}>
                          <span style={{fontSize:14,fontWeight:700,color:T.g900}}>{stay.name}</span>
                          <span style={{fontSize:10,fontWeight:600,padding:"1px 7px",borderRadius:10,background:stype.bg,color:stype.color,border:`1px solid ${stype.border}`}}>{stype.label}</span>
                          {stay.booked&&<span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10,background:"#D1FAE5",color:"#065F46"}}>הוזמן ✓</span>}
                        </div>
                        {stay.address&&<div style={{fontSize:12,color:T.g500,marginBottom:2}}>{stay.address}</div>}
                        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:stay.notes?4:0}}>
                          <span style={{fontSize:12,color:T.g500}}>{fmtDate(stay.checkIn)}–{fmtDate(stay.checkOut)}</span>
                          {isAdmin&&<span style={{fontSize:12,fontWeight:600,color:stype.color}}>${stay.price}{stay.perNight?"/לילה":""}</span>}
                          {isAdmin&&n>0&&<span style={{fontSize:12,color:T.teal,fontWeight:600}}>סה"כ: ${+stay.price*n}</span>}
                        </div>
                        {stay.notes&&<div style={{fontSize:11,color:T.g600,lineHeight:1.4,marginBottom:3}}>{stay.notes}</div>}
                        {stay.link&&<a href={stay.link} target="_blank" rel="noreferrer" style={{fontSize:11,color:T.teal}}>🔗 קישור</a>}
                      </div>
                    </div>
                    {(isAdmin||canEdit)&&<div style={{display:"flex",gap:6,justifyContent:"flex-end",marginTop:10,paddingTop:8,borderTop:`1px solid ${T.g100}`}}>
                      <Btn v="ghost" sm onClick={()=>onEdit(stay)}>✏️ ערוך</Btn>
                      <Btn v="danger" sm onClick={()=>onDel(stay.id)}>מחק</Btn>
                    </div>}
                  </div>
                </Card>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function SummaryTab({stops,flights,stays,isAdmin}){
  const ft=flights.reduce((s,f)=>s+(+f.price||0),0)*3;
  const ht=stays.reduce((s,h)=>{const n=nts(h.checkIn,h.checkOut);return s+(h.perNight?+h.price*n:+h.price)||0;},0);
  const CL=["E-Visa לוייטנאם ($25/אדם)","ביטוח נסיעות","חיסונים — הפטיטיס A+B, טיפוס","הזמנת Airbnb האנוי","הזמנת וילה הוי אן","הזמנת ריזורט פו קווק","SIM וייטנאמי","הורדת Grab"];
  return(
    <div>
      {isAdmin&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {[["טיסות (×3)","$"+ft.toLocaleString(),`${flights.filter(f=>f.status==="confirmed").length}/${flights.length} מאושרות`,T.blue],
          ["לינות","$"+ht.toLocaleString(),`${stays.filter(s=>s.booked).length}/${stays.length} הוזמנו`,T.amber],
          ["סה\"כ משוער","$"+(ft+ht+900).toLocaleString(),"+ אוכל, סיורים",T.tealDk],
          ["ממוצע יומי","$"+Math.round((ft+ht+900)/19),"19 ימים",T.teal],
        ].map(([l,v,s,c])=>(
          <Card key={l}><div style={{padding:"12px 14px"}}><div style={{fontSize:11,color:T.g400,marginBottom:2}}>{l}</div><div style={{fontSize:19,fontWeight:700,color:c,marginBottom:1}}>{v}</div><div style={{fontSize:11,color:T.g400}}>{s}</div></div></Card>
        ))}
      </div>}
      <Card style={{marginBottom:12}}>
        <div style={{padding:"14px 16px"}}>
          <Lbl c="סטטוס לינות"/>
          {stops.map(s=>{
            const ss=stays.filter(h=>h.stopId===s.id);
            const ok=ss.some(h=>h.booked);
            const has=ss.length>0;
            return(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${T.g100}`}}>
                <span>{s.icon}</span>
                <span style={{fontSize:13,flex:1,color:T.g700,fontWeight:500}}>{s.city}</span>
                <span style={{fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:10,background:ok?"#D1FAE5":has?"#FEF3C7":"#FEE2E2",color:ok?"#065F46":has?"#92400E":"#991B1B"}}>{ok?"הוזמן ✓":has?"לא הוזמן":"חסר"}</span>
              </div>
            );
          })}
        </div>
      </Card>
      <Card>
        <div style={{padding:"14px 16px"}}>
          <Lbl c="צ'קליסט"/>
          {CL.map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"7px 0",borderBottom:i<CL.length-1?`1px solid ${T.g100}`:"none"}}>
              <div style={{width:17,height:17,borderRadius:4,border:`2px solid ${T.g300}`,flexShrink:0,marginTop:1}}/>
              <span style={{fontSize:13,color:T.g700}}>{t}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function App(){
  const [user,setUser]=useState(null);
  const [stops,setStops]=useState(DEF_STOPS);
  const [flights,setFlights]=useState(DEF_FLIGHTS);
  const [stays,setStays]=useState(DEF_STAYS);
  const [synced,setSynced]=useState(false);
  const [saving,setSaving]=useState(false);
  const [tab,setTab]=useState("timeline");
  const [modal,setModal]=useState(null);

  const isAdmin=user?.admin===true;
  const canEdit=user?.canEdit===true;

  useEffect(()=>{
    if(!user)return;
    let mounted=true;
    (async()=>{
      const data=await fb.get("trip");
      if(!mounted)return;
      if(data){
        if(data.stops)setStops(Object.values(data.stops));
        if(data.flights)setFlights(Object.values(data.flights));
        if(data.stays)setStays(Object.values(data.stays));
      }else{
        await fb.set("trip/stops",Object.fromEntries(DEF_STOPS.map(s=>[s.id,s])));
        await fb.set("trip/flights",Object.fromEntries(DEF_FLIGHTS.map(f=>[f.id,f])));
        await fb.set("trip/stays",Object.fromEntries(DEF_STAYS.map(h=>[h.id,h])));
      }
      if(mounted)setSynced(true);
    })();
    const u1=fb.listen("trip/stops",   d=>{ if(mounted&&d)setStops(Object.values(d)); });
    const u2=fb.listen("trip/flights", d=>{ if(mounted&&d)setFlights(Object.values(d)); });
    const u3=fb.listen("trip/stays",   d=>{ if(mounted&&d)setStays(Object.values(d)); });
    return ()=>{ mounted=false; u1(); u2(); u3(); };
  },[user]);

  const saveFlight=async f=>{setFlights(p=>{const e=p.find(x=>x.id===f.id);return e?p.map(x=>x.id===f.id?f:x):[...p,f];});setModal(null);setSaving(true);await fb.patch("trip/flights",{[f.id]:f});setSaving(false);};
  const delFlight=async id=>{setFlights(p=>p.filter(f=>f.id!==id));await fb.del(`trip/flights/${id}`);};
  const saveStay=async s=>{setStays(p=>{const e=p.find(x=>x.id===s.id);return e?p.map(x=>x.id===s.id?s:x):[...p,s];});setModal(null);setSaving(true);await fb.patch("trip/stays",{[s.id]:s});setSaving(false);};
  const delStay=async id=>{setStays(p=>p.filter(s=>s.id!==id));await fb.del(`trip/stays/${id}`);};
  const saveStop=async s=>{
    // Find trip boundaries from international flights
    const intlOut = flights.find(f=>f.from==="TLV");
    const intlIn  = flights.find(f=>f.to==="TLV");
    const tripStart = intlOut?.date || "2026-09-04";
    const tripEnd   = intlIn?.date  || "2026-09-22";

    const addDays=(dateStr,n)=>{
      const d=new Date(dateStr); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10);
    };
    const daysBetween=(a,b)=>Math.round((new Date(b)-new Date(a))/864e5);

    // Update the changed stop
    const nights = s.nights>0 ? s.nights : Math.max(1,daysBetween(s.dateIn,s.dateOut));
    const updatedStop = {...s, nights, dateOut: addDays(s.dateIn, nights)};

    // Cascade: shift all stops after this one
    const sorted = [...stops].sort((a,b)=>a.dateIn.localeCompare(b.dateIn));
    const idx = sorted.findIndex(x=>x.id===s.id);
    let cursor = updatedStop.dateOut;
    const cascaded = sorted.map((st,i)=>{
      if(i<=idx) return st.id===s.id ? updatedStop : st;
      // shift forward, but cap at tripEnd minus remaining stops
      const stNights = st.nights || Math.max(1,daysBetween(st.dateIn,st.dateOut));
      const newIn  = cursor;
      const newOut = addDays(newIn, stNights);
      // dont push past trip end
      const cappedIn  = newIn  <= tripEnd ? newIn  : tripEnd;
      const cappedOut = newOut <= tripEnd ? newOut : tripEnd;
      cursor = cappedOut;
      return {...st, dateIn:cappedIn, dateOut:cappedOut, nights:Math.max(0,daysBetween(cappedIn,cappedOut))};
    });

    // Update state immediately
    setStops(cascaded);
    setModal(null);
    setSaving(true);
    // Save all affected stops to firebase
    const updates = Object.fromEntries(cascaded.map(st=>[st.id,st]));
    await fb.set("trip/stops", updates);
    setSaving(false);
  };
  const addStop=async()=>{ const id="s"+uid(); const newStop={id,city:"עיר חדשה",eng:"New City",icon:"🗺️",color:"#374151",dateIn:"",dateOut:"",nights:0,notes:"",flag:"",tagline:"",about:"",chips:[]}; setStops(p=>[...p,newStop]); setModal({t:"stop",d:newStop}); setSaving(true);await fb.patch("trip/stops",{[id]:newStop});setSaving(false); };
  const delStop=async id=>{ setStops(p=>p.filter(s=>s.id!==id)); const staysToKeep=stays.filter(s=>s.stopId!==id); setStays(staysToKeep); setModal(null); await fb.del("trip/stops/"+id); await fb.set("trip/stays",Object.fromEntries(staysToKeep.map(s=>[s.id,s]))); };

  if(!user)return <LoginScreen onLogin={setUser}/>;

  const ft=flights.reduce((s,f)=>s+(+f.price||0),0)*3;
  const ht=stays.reduce((s,h)=>{const n=nts(h.checkIn,h.checkOut);return s+(h.perNight?+h.price*n:+h.price)||0;},0);

  const TABS=[
    {id:"timeline",l:"מסלול",i:"🗺"},
    {id:"flights",l:"טיסות",i:"✈"},
    {id:"stays",l:"לינה",i:"🏨"},
    {id:"summary",l:"סיכום",i:"📋"},
    {id:"ai",l:"AI",i:"✦"},
  ];

  return(
    <div style={{background:T.sand,minHeight:"100vh",fontFamily:"'DM Sans','Segoe UI',sans-serif",direction:"rtl",fontSize:14}}>
      <div style={{background:`linear-gradient(160deg,${T.tealDk},${T.teal} 60%,${T.tealMd})`,padding:"16px 18px 0",color:"#fff"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:"rgba(255,255,255,.5)",marginBottom:3}}>Trip Manager · Sep 2026</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:24,fontWeight:900,lineHeight:1.1}}>Vietnam &amp; Bangkok</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.55)",marginTop:2}}>4.09 – 22.09 · 3 נוסעים · 18 לילות</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
            <div style={{fontSize:11,padding:"3px 10px",borderRadius:20,background:"rgba(255,255,255,.15)",color:"rgba(255,255,255,.8)"}}>{user.icon} {user.name}</div>
            <div style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:synced?"rgba(255,255,255,.2)":"rgba(255,255,255,.1)",color:"rgba(255,255,255,.7)"}}>{saving?"שומר...":synced?"🔴 Live":"⏳ מתחבר"}</div>
            <button onClick={()=>{setUser(null);setSynced(false);}} style={{fontSize:10,color:"rgba(255,255,255,.4)",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:0}}>החלף משתמש</button>
          </div>
        </div>
        <div style={{display:"flex",background:"rgba(255,255,255,.1)",borderRadius:"10px 10px 0 0",overflow:"hidden"}}>
          {[["טיסות",flights.length],["לינות",stays.length],["הוזמנו",stays.filter(s=>s.booked).length+"/"+stays.length],
            ...(isAdmin?[["עלות","$"+(ft+ht).toLocaleString()]]:[[" "," "]])
          ].map(([l,v],i)=>(
            <div key={l} style={{flex:1,padding:"10px 0",textAlign:"center",borderLeft:i>0?"1px solid rgba(255,255,255,.15)":"none"}}>
              <div style={{fontSize:15,fontWeight:700}}>{v}</div>
              <div style={{fontSize:9,opacity:.5,letterSpacing:".04em",textTransform:"uppercase"}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{position:"sticky",top:0,zIndex:100,background:T.white,borderBottom:`1px solid ${T.g200}`,boxShadow:"0 1px 8px rgba(0,0,0,.06)"}}>
        <div style={{display:"flex"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 2px",textAlign:"center",fontSize:11,fontWeight:tab===t.id?700:500,color:tab===t.id?T.teal:T.g400,background:"none",border:"none",borderBottom:tab===t.id?`2px solid ${T.teal}`:"2px solid transparent",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
              <div style={{fontSize:14,marginBottom:1}}>{t.i}</div>{t.l}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:640,margin:"0 auto",padding:"16px 14px 60px"}}>
        {tab==="timeline"&&<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div style={{fontSize:15,fontWeight:700,color:T.g900}}>מסלול הטיול</div>{(isAdmin||canEdit)&&<Btn sm onClick={addStop}>+ עצירה</Btn>}</div><TimelineTab stops={stops} flights={flights} stays={stays} isAdmin={isAdmin} canEdit={canEdit} onEditStop={st=>setModal({t:"stop",d:st})} onEditStay={s=>setModal({t:"editStay",d:s})} onAddStay={id=>setModal({t:"addStay",d:{stopId:id||stops[0]?.id}})} onDelStop={delStop}/></>}
        {tab==="flights" &&<FlightsTab flights={flights} isAdmin={isAdmin} canEdit={canEdit} onAdd={()=>setModal({t:"addFlight"})} onEdit={f=>setModal({t:"editFlight",d:f})} onDel={delFlight}/>}
        {tab==="stays"   &&<StaysTab stays={stays} stops={stops} isAdmin={isAdmin} canEdit={canEdit} onAdd={id=>setModal({t:"addStay",d:{stopId:id||stops[0]?.id}})} onEdit={s=>setModal({t:"editStay",d:s})} onDel={delStay}/>}
        {tab==="summary" &&<SummaryTab stops={stops} flights={flights} stays={stays} isAdmin={isAdmin}/>}
        {tab==="ai"      &&<AIChat stops={stops} flights={flights} stays={stays}/>}
      </div>

      {(isAdmin||canEdit)&&modal?.t==="addFlight"  &&<Modal title="טיסה חדשה"  onClose={()=>setModal(null)}><FlightForm onSave={f=>saveFlight({...f,id:uid()})} onClose={()=>setModal(null)}/></Modal>}
      {(isAdmin||canEdit)&&modal?.t==="editFlight" &&<Modal title="עריכת טיסה" onClose={()=>setModal(null)}><FlightForm init={modal.d} onSave={saveFlight} onClose={()=>setModal(null)}/></Modal>}
      {(isAdmin||canEdit)&&modal?.t==="addStay"    &&<Modal title="לינה חדשה"   onClose={()=>setModal(null)}><StayForm init={modal.d} stops={stops} onSave={s=>saveStay({...s,id:uid()})} onClose={()=>setModal(null)}/></Modal>}
      {(isAdmin||canEdit)&&modal?.t==="editStay"   &&<Modal title="עריכת לינה"  onClose={()=>setModal(null)}><StayForm init={modal.d} stops={stops} onSave={saveStay} onClose={()=>setModal(null)}/></Modal>}
      {(isAdmin||canEdit)&&modal?.t==="stop"       &&<Modal title={`עריכת ${modal.d.city}`} onClose={()=>setModal(null)}><StopForm init={modal.d} onSave={saveStop} onClose={()=>setModal(null)} onDelete={isAdmin?delStop:null}/></Modal>}
      {!isAdmin&&canEdit &&modal?.t==="mStop"      &&<Modal title={`הערות — ${modal.d.city}`} onClose={()=>setModal(null)}><MemberStopForm init={modal.d} onSave={saveStop} onClose={()=>setModal(null)}/></Modal>}
    </div>
  );
}

export default App;