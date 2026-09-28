let webllm=null,engine=null,currentModel=null;
export function capability(){return {webgpu:!!navigator.gpu,worker:'Worker' in window,secure:isSecureContext,online:navigator.onLine}}
export async function loadLibrary(){if(webllm)return webllm;webllm=await import('https://esm.run/@mlc-ai/web-llm@0.2.85');return webllm}
export async function models(){const w=await loadLibrary();return (w.prebuiltAppConfig?.model_list||[]).map(x=>({id:x.model_id||x.model,name:x.model_id||x.model,model_lib:x.model_lib})).filter(x=>x.id)}
export async function loadModel(modelId,onProgress=()=>{}){
  if(!navigator.gpu)throw new Error('WebGPU is not available in this browser/device.');
  const w=await loadLibrary();
  if(engine&&currentModel===modelId)return engine;
  if(engine){try{await engine.unload()}catch{}}
  const worker=new Worker('./assets/js/webllm-worker.js',{type:'module'});
  engine=await w.CreateWebWorkerMLCEngine(worker,modelId,{initProgressCallback:onProgress,appConfig:{...w.prebuiltAppConfig,useIndexedDBCache:true},logLevel:'WARN'});
  currentModel=modelId;return engine;
}
export async function ask(messages,{temperature=.3,max_tokens=900}={}){
  if(!engine)throw new Error('Load a local WebLLM model first.');
  const res=await engine.chat.completions.create({messages,temperature,max_tokens});
  return res.choices?.[0]?.message?.content||'';
}
export async function unload(){if(engine){await engine.unload();engine=null;currentModel=null}}
export function fallbackPlan(input){
  const domains=(input.domains||[]).join(', ')||'connectivity';
  return `LOCAL PLANNING FALLBACK\n\nProblem: ${input.problem||'Not specified'}\nGeography: ${input.geography||'Texas'}\nStakeholders: ${input.stakeholders||'Not specified'}\nDomains: ${domains}\n\n1. Verify the access barrier: availability, affordability, device, skills, reliability, accessibility, trust/relevance, or power dependency.\n2. Gather dated evidence from official maps/data plus locally observed performance; keep community observations separate from verified coverage.\n3. Convene the minimum cross-domain team needed to act.\n4. Define a measurable intervention, owner, dependencies, cost range, maintenance plan, and verification method.\n5. Check active program eligibility at official sources; never rely on a cached funding status.\n6. Run a resilience check for power/network failure and accessibility.\n7. Publish status as proposed → validated → funded → building → operational → adopted, with evidence at each transition.\n\nThis fallback is deterministic planning guidance, not an AI-generated factual assessment.`;
}
