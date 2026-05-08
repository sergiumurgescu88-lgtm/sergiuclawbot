import{r as a,j as e}from"./ui-DB1i9q7v.js";
const y={SOUL:{icon:"💫",desc:"Misiune, valori, reguli absolute, autonomie"},IDENTITY:{icon:"👤",desc:"Profil agent, ton, limbă, program de lucru"},USER:{icon:"🎯",desc:"Profilul tău, preferințe, priorități 90 zile"},MEMORY:{icon:"🧠",desc:"Context business, produse, prețuri, USP"},TOOLS:{icon:"🛠️",desc:"Canale, CRM, API-uri AI, buget, comenzi"},AGENTS:{icon:"🤖",desc:"Echipa de sub-agenți, workflow-uri, pipeline"},HEARTBEAT:{icon:"💓",desc:"Task-uri proactive, rutine, trigger-e, alerte"},BOOTSTRAP:{icon:"🚀",desc:"Checklist lansare, pași critici, fallback plan"},AGENT_RD:{icon:"🔬",desc:"Research framework, validare idei, surse"}};

function P({data:t,onBack:N}){
  const[jobId,setJobId]=a.useState(null);
  const[jobStatus,setJobStatus]=a.useState("idle");
  const[progress,setProgress]=a.useState({done:0,total:9,current:"",files_done:[]});
  const[fileContents,setFileContents]=a.useState({});
  const[preview,setPreview]=a.useState(null);
  const[profileSaved,setProfileSaved]=a.useState(false);
  const[zipB64,setZipB64]=a.useState(null);
  const[errorMsg,setErrorMsg]=a.useState("");
  const[u]=a.useState(()=>localStorage.getItem("agentulmeu_token")||"");
  const esRef=a.useRef(null);
  const i=Object.keys(y);

  a.useEffect(()=>{if(t&&t.business_name&&u&&!profileSaved)saveProfile();},[]);
  a.useEffect(()=>()=>{if(esRef.current)esRef.current.close();},[]);

  const saveProfile=async()=>{
    try{
      const r=await(await fetch("/api/profile",{method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${u}`},
        body:JSON.stringify({business:{name:t.business_name||"Business",type:t.business_category?[t.business_category]:[],description:t.business_description||"",products:t.products_services||"",ideal_client:t.ideal_client||"",region:""},goals:{primary:(t.objectives||"").split(",").map(n=>n.trim()).filter(Boolean),top_problem:t.main_problem||"",repetitive_tasks:[],priority_90days:t.priority_90_days||""},agents_needed:t.exec_agents||[],personality:{tone:t.tone||"Profesional",language:t.language||"Română"},channels:{active:t.channels||[]}})})).json();
      if(r.success)setProfileSaved(true);
    }catch(err){console.error("Profile save error:",err);}
  };

  const startGenerate=async()=>{
    if(jobStatus==="running")return;
    setJobStatus("running");setProgress({done:0,total:9,current:"",files_done:[]});
    setFileContents({});setZipB64(null);setErrorMsg("");
    try{
      const res=await fetch("/api/generate-zip",{method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({intake_data:t})});
      const json=await res.json();
      if(!json.job_id){setJobStatus("error");setErrorMsg(json.error||"Nu s-a primit job_id");return;}
      const id=json.job_id;
      setJobId(id);
      const es=new EventSource(`/api/job/${id}/progress`);
      esRef.current=es;
      es.onmessage=(ev)=>{
        try{
          const d=JSON.parse(ev.data);
          setProgress({done:d.done||0,total:d.total||9,current:d.current||"",files_done:d.files_done||[]});
          if(d.status==="done"||(d.files_done&&d.files_done.length>=9)){es.close();fetchResult(id);}
          if(d.error){es.close();setJobStatus("error");setErrorMsg(d.error);}
        }catch(e){}
      };
      es.onerror=()=>{es.close();fetchResult(id);};
    }catch(err){setJobStatus("error");setErrorMsg(err.message);}
  };

  const fetchResult=async(id)=>{
    for(let attempt=0;attempt<40;attempt++){
      try{
        const json=await(await fetch(`/api/job/${id}/result`)).json();
        if(json.status==="done"){
          const contents={};
          if(json.files)Object.entries(json.files).forEach(([ft,info])=>{if(info.content)contents[ft]=info.content;});
          setFileContents(contents);
          if(json.zip_b64)setZipB64(json.zip_b64);
          setJobStatus("done");setProgress(p=>({...p,done:9,total:9,files_done:Object.keys(y)}));
          return;
        }
        if(json.status==="error"){setJobStatus("error");setErrorMsg(json.error||"Eroare job");return;}
      }catch(e){}
      await new Promise(r=>setTimeout(r,5000));
    }
    setJobStatus("error");setErrorMsg("Timeout — verifică job-ul manual.");
  };

  const downloadZip=()=>{
    if(!zipB64)return;
    const bin=atob(zipB64);const arr=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
    const blob=new Blob([arr],{type:"application/zip"});
    const url=URL.createObjectURL(blob);
    const a2=document.createElement("a");a2.href=url;a2.download="AgentulMeu_Files.zip";a2.click();
    URL.revokeObjectURL(url);
  };

  const downloadSingle=(ft)=>{
    const content=fileContents[ft]||`# ${ft}.md\n\nFișier generat de AgentulMeu.online`;
    const blob=new Blob([content],{type:"text/markdown"});
    const url=URL.createObjectURL(blob);
    const a2=document.createElement("a");a2.href=url;a2.download=`${ft}.md`;a2.click();
    URL.revokeObjectURL(url);
  };

  const doneFiles=progress.files_done||[];
  const doneCount=jobStatus==="done"?9:doneFiles.length;
  const pct=Math.round((doneCount/9)*100);

  return e.jsx("div",{className:"min-h-screen pt-24 pb-12",children:
    e.jsxs("div",{className:"container-custom",children:[
      e.jsx("button",{className:"mb-8 text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2",onClick:N,children:"← Înapoi"}),
      e.jsxs("div",{className:"flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8",children:[
        e.jsxs("div",{children:[
          e.jsx("h2",{className:"text-3xl font-bold",children:"📁 Dashboard — Cele 9 Fișiere MD"}),
          t?.business_name&&e.jsxs("p",{className:"text-slate-400 mt-1",children:["Business: ",e.jsx("span",{className:"text-blue-400",children:t.business_name})]})
        ]}),
        e.jsxs("div",{className:"flex gap-3 flex-wrap",children:[
          e.jsx("button",{className:"btn-secondary",onClick:startGenerate,disabled:jobStatus==="running",
            children:jobStatus==="running"?"⏳ Generez...":jobStatus==="done"?"🔄 Regenerează":"🔄 Generează Toate (9)"}),
          e.jsx("button",{className:`btn-primary ${!zipB64?"opacity-50":""}`,onClick:downloadZip,disabled:!zipB64,
            children:`📦 Descarcă ZIP (${doneCount}/9)`})
        ]})
      ]}),
      (jobStatus==="running"||jobStatus==="done")&&e.jsxs("div",{className:"mb-6",children:[
        e.jsxs("div",{className:"flex justify-between text-sm text-slate-400 mb-2",children:[
          e.jsx("span",{children:jobStatus==="running"?`⚙ Generez: ${progress.current||"..."}`:
            "✅ Toate fișierele generate! Descarcă ZIP-ul."}),
          e.jsxs("span",{children:[doneCount,"/9"]})
        ]}),
        e.jsx("div",{className:"w-full h-2 bg-white/10 rounded-full overflow-hidden",children:
          e.jsx("div",{className:"h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500",style:{width:`${pct}%`}})})
      ]}),
      errorMsg&&e.jsxs("div",{className:"mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400",children:["❌ ",errorMsg]}),
      jobId&&jobStatus==="running"&&e.jsx("p",{className:"text-xs text-slate-500 mb-4",children:`Job ID: ${jobId}`}),
      e.jsx("div",{className:"grid md:grid-cols-2 lg:grid-cols-3 gap-4",children:
        i.map(ft=>{
          const meta=y[ft];
          const isDone=jobStatus==="done"||(doneFiles.includes(ft)&&!!fileContents[ft]);
          const isCurrent=progress.current===ft&&jobStatus==="running";
          const isWaiting=jobStatus==="running"&&!isDone&&!isCurrent;
          return e.jsxs("div",{className:"card",children:[
            e.jsxs("div",{className:"flex items-start justify-between mb-3",children:[
              e.jsxs("div",{className:"flex items-center gap-2",children:[
                e.jsx("span",{className:"text-2xl",children:meta.icon}),
                e.jsxs("h3",{className:"font-semibold text-white",children:[ft,".md"]})
              ]}),
              e.jsx("span",{className:`text-xs px-2 py-1 rounded-full font-medium ${isDone?"bg-emerald-500/20 text-emerald-400 border border-emerald-500/30":isCurrent?"bg-yellow-500/20 text-yellow-400 border border-yellow-500/30":isWaiting?"bg-blue-500/20 text-blue-400 border border-blue-500/30":"bg-slate-700/50 text-slate-400"}`,
                children:isDone?"✓ Gata":isCurrent?"⚙ Generez...":isWaiting?"⏳ Aștept...":"Negenerat"})
            ]}),
            e.jsx("p",{className:"text-sm text-slate-400 mb-4",children:meta.desc}),
            e.jsxs("div",{className:"flex gap-2",children:[
              e.jsx("button",{className:"px-3 btn-secondary text-sm",disabled:!isDone,
                onClick:()=>isDone&&setPreview({file:ft,content:fileContents[ft]}),title:"Previzualizare",children:"👁"}),
              e.jsx("button",{className:"px-3 btn-secondary text-sm",disabled:!isDone,
                onClick:()=>isDone&&downloadSingle(ft),title:"Descarcă",children:"↓"})
            ]})
          ]},ft);
        })
      }),
      preview&&e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90",
        onClick:()=>setPreview(null),children:
        e.jsxs("div",{className:"card max-w-2xl w-full max-h-[80vh] overflow-y-auto",
          onClick:ev=>ev.stopPropagation(),children:[
          e.jsxs("div",{className:"flex items-center justify-between mb-4",children:[
            e.jsxs("h3",{className:"font-bold text-white",children:[preview.file,".md"]}),
            e.jsx("button",{className:"text-slate-400 hover:text-white transition-colors",onClick:()=>setPreview(null),children:"✕"})
          ]}),
          e.jsx("pre",{className:"text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed",children:preview.content||"(fișier gol)"})
        ]})
      })
    ]})
  });
}
export{P as default};
