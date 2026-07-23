import { NextResponse } from "next/server";
import { parseMycoCommand } from "@/lib/ai-command";
import type { AppState } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SECRET = "sherman-jesus-500-7f3a9c";
const species = ["PE", "B+", "GT", "Lion's Mane", "Reishi", "Shiitake", "King Oyster", "Maitake"];
const ids = ["PE-001", "BPLUS-002", "GT-003", "LM-004", "REISHI-005", "SHIITAKE-006", "KO-007", "MAITAKE-008"];
const locations = ["Martha", "Shelf A", "Shelf B", "Incubator", "Fruiting Room"];

const state: AppState = {
  counters: {},
  cultures: [
    { id: "CUL-001", species: "PE", type: "agar", storage: "fridge", qty: 3, date: "2026-07-20" },
    { id: "CUL-002", species: "Lion's Mane", type: "lc", storage: "room", qty: 2, date: "2026-07-21" },
  ],
  batches: ids.map((id, i) => ({
    id,
    species: species[i],
    phase: i < 2 ? "grain" : i < 4 ? "break" : i < 6 ? "bulk" : "fruiting",
    qty: i + 1,
    qtyUnit: i < 4 ? "quart jars" : "tubs",
    location: locations[i % locations.length],
    flushes: i >= 6 ? [{ n: 1, freshWeight: 400 + i * 10, dryWeight: null, harvestDate: "2026-07-22", driedDate: null }] : [],
    history: [],
  })),
  inventory: { PE: 42, GT: 28, "Lion's Mane": 35 },
  lifetimeInventory: { PE: 120, GT: 75, "Lion's Mane": 90 },
  activity: [],
};

type Expected = Record<string, string | number>;
type Case = { id: number; category: string; prompt: string; expected: Expected[] };

function cases(): Case[] {
  const out: Case[] = [];
  let n = 1;
  const add = (category: string, prompt: string, expected: Expected[]) => out.push({ id: n++, category, prompt, expected });
  const batchT = [(s:string,q:number)=>`Inoculated ${q} quart jars of ${s} today.`,(s:string,q:number)=>`Knocked up ${q} jars with ${s}.`,(s:string,q:number)=>`Started ${q} grain jars, strain ${s}.`,(s:string,q:number)=>`${s}: ${q} qrt jars inoculated`,(s:string,q:number)=>`put ${s} to grain in ${q} jars`];
  for(let i=0;i<100;i++){const s=species[i%8],q=i%7+1;add("add_batch",batchT[i%5](s,q),[{action:"add_batch",species:s,quantity:q,phase:"grain"}]);}
  const cultureT=[(s:string,q:number,t:string,r:string)=>`Added ${q} ${s} ${t==="lc"?"liquid culture jars":"agar plates"} to the ${r}.`,(s:string,q:number,t:string,r:string)=>`${q} ${s} ${t} cultures, stored ${r==="fridge"?"in fridge":"at room temp"}.`,(s:string,q:number,t:string,r:string)=>`made ${q} new ${s} ${t==="lc"?"LCs":"plates"}; ${r}`];
  for(let i=0;i<60;i++){const s=species[i%8],q=i%5+1,t=i%2===0?"agar":"lc",r=i%3===0?"fridge":"room";add("add_culture",cultureT[i%3](s,q,t,r),[{action:"add_culture",species:s,quantity:q,cultureType:t,storage:r}]);}
  const breakT=[(x:string)=>`Break and shake ${x}.`,(x:string)=>`B&S done on batch ${x}`,(x:string)=>`shook up ${x} today`,(x:string)=>`${x} got its break n shake`];
  for(let i=0;i<40;i++){const x=ids[i%2];add("advance_break",breakT[i%4](x),[{action:"advance_break",batchId:x}]);}
  const bulkT=[(x:string,q:number)=>`Spawned ${x} into ${q} tubs.`,(x:string,q:number)=>`${x} went to bulk, ${q} monotubs`,(x:string,q:number)=>`S2B ${x} into ${q} shoeboxes`,(x:string,q:number)=>`mixed batch ${x} with substrate and made ${q} tubs`,(x:string,q:number)=>`spawned-to-bulk ${x}; qty ${q}`];
  for(let i=0;i<50;i++){const x=ids[2+i%2],q=i%4+1;add("spawn_bulk",bulkT[i%5](x,q),[{action:"spawn_bulk",batchId:x,quantity:q,phase:"bulk"}]);}
  const fruitT=[(x:string)=>`Moved ${x} to fruiting conditions.`,(x:string)=>`${x} is fruiting now`,(x:string)=>`put batch ${x} into FC`,(x:string)=>`introduced fruiting for ${x}`];
  for(let i=0;i<40;i++){const x=ids[4+i%2];add("move_fruiting",fruitT[i%4](x),[{action:"move_fruiting",batchId:x,phase:"fruiting"}]);}
  const moveT=[(x:string,l:string)=>`Moved ${x} to ${l}.`,(x:string,l:string)=>`${x} is now in the ${l}`,(x:string,l:string)=>`relocated batch ${x} -> ${l}`,(x:string,l:string)=>`put ${x} on ${l}`];
  for(let i=0;i<40;i++){const x=ids[i%8],l=locations[(i+1)%5];add("move_location",moveT[i%4](x,l),[{action:"move_location",batchId:x,location:l}]);}
  const harvestT=[(x:string,g:number)=>`Harvested ${g} g fresh from ${x}.`,(x:string,g:number)=>`${x} flush harvested at ${g} grams wet`,(x:string,g:number)=>`pulled ${g}g fresh off batch ${x}`,(x:string,g:number)=>`first flush ${x}: ${g} grams`,(x:string,g:number)=>`${x} produced ${g}g fresh today`];
  for(let i=0;i<50;i++){const x=ids[6+i%2],g=200+i*7;add("harvest",harvestT[i%5](x,g),[{action:"harvest",batchId:x,grams:g}]);}
  const dryT=[(x:string,f:number,d:number)=>`Harvested ${f} g fresh from ${x}, dried to ${d} g.`,(x:string,f:number,d:number)=>`${x}: ${f}g wet and ${d}g cracker dry`,(x:string,f:number,d:number)=>`flush from ${x} weighed ${f} grams fresh; final dry weight ${d}`,(x:string,f:number,d:number)=>`pulled ${f}g off ${x}, ended up ${d}g dry`,(x:string,f:number,d:number)=>`${x} harvest ${f} fresh / ${d} dry`];
  for(let i=0;i<50;i++){const x=ids[6+i%2],f=300+i*9,d=Math.round(f*.1);add("harvest_and_dry",dryT[i%5](x,f,d),[{action:"harvest",batchId:x,grams:f},{action:"dry_weight",batchId:x,grams:d}]);}
  const stockT=[(s:string,g:number)=>`Add ${g} g dried ${s} to inventory.`,(s:string,g:number)=>`I have ${g} grams of dried ${s} stock`,(s:string,g:number)=>`${s} dry inventory +${g}g`];
  for(let i=0;i<30;i++){const s=species[i%8],g=10+i*3;add("add_dried_stock",stockT[i%3](s,g),[{action:"add_dried_stock",species:s,grams:g}]);}
  const retireT=[(x:string)=>`Discarded ${x} due to trich.`,(x:string)=>`${x} contaminated, toss it`,(x:string)=>`retire batch ${x}`,(x:string)=>`${x} is done and has been discarded`];
  for(let i=0;i<40;i++){const x=ids[i%8];add("retire_batch",retireT[i%4](x),[{action:"retire_batch",batchId:x}]);}
  if(out.length!==500) throw new Error(`Built ${out.length} cases`);
  return out;
}

function validate(result: Awaited<ReturnType<typeof parseMycoCommand>>, expected: Expected[]) {
  const errors:string[]=[];
  if(result.needsClarification) errors.push(`unexpected clarification: ${result.clarification??"none"}`);
  if(result.actions.length!==expected.length) errors.push(`expected ${expected.length} actions, got ${result.actions.length}`);
  expected.forEach((wanted,i)=>{const actual=result.actions[i];if(!actual)return;Object.entries(wanted).forEach(([k,v])=>{const a=actual[k as keyof typeof actual];const same=typeof a==="string"&&typeof v==="string"?a.trim().toLowerCase()===v.trim().toLowerCase():a===v;if(!same)errors.push(`action ${i+1} ${k}: expected ${v}, got ${String(a)}`);});});
  return errors;
}

export async function GET(request: Request) {
  const url=new URL(request.url);
  if(process.env.VERCEL_ENV==="production"&&url.searchParams.get("secret")!==SECRET)return NextResponse.json({error:"Forbidden"},{status:403});
  const start=Math.max(0,Number(url.searchParams.get("start")??0));
  const count=Math.min(25,Math.max(1,Number(url.searchParams.get("count")??10)));
  const selected=cases().slice(start,start+count);
  const outcomes=[];
  for(const test of selected){try{const result=await parseMycoCommand(test.prompt,state);const errors=validate(result,test.expected);outcomes.push({id:test.id,category:test.category,prompt:test.prompt,passed:errors.length===0,errors,result});}catch(error){outcomes.push({id:test.id,category:test.category,prompt:test.prompt,passed:false,errors:[error instanceof Error?error.message:"Unknown parser error"],result:null});}}
  const failures=outcomes.filter(x=>!x.passed);
  return NextResponse.json({totalSuiteSize:500,start,count:selected.length,passed:outcomes.length-failures.length,failed:failures.length,failures});
}
