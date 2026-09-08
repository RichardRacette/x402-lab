import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { access, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { encodePaymentRequiredHeader, encodePaymentResponseHeader } from "@x402/core/http";
import { buyerTraceIntent, createBuyerTracePlan, runBuyerTrace, type BuyerTraceOptions } from "./buyer-trace-adapter.js";
import { mintOwnerCliPurchaseAuthorization } from "./trust-boundary.js";

async function setup() {
  const plan=createBuyerTracePlan();
  const sessionFile=join(await mkdtemp(join(tmpdir(),"trace-runtime-")),"session.jsonl");
  const expiresAt=Date.now()+600_000;
  const options: BuyerTraceOptions={execute:true,sessionFile,expiresAt,
    authorization:mintOwnerCliPurchaseAuthorization(buyerTraceIntent(plan,sessionFile,expiresAt))};
  let signs=0;
  const send=async (request: Request) => request.headers.has("PAYMENT-SIGNATURE")
    ? Response.json({data:[],pagination:{page:0,page_size:100,has_next_page:false}})
    : new Response(null,{status:402,headers:{"PAYMENT-REQUIRED":encodePaymentRequiredHeader({x402Version:2,resource:{url:plan.url,description:"fixture",mimeType:"application/json"},accepts:[plan.requirement]})}});
  return {plan,options,send,createPayment:async()=>{signs++;return "SYNTHETIC_NOT_REPLAYABLE";},signs:()=>signs};
}
test("missing and expired approval cannot reach payment authority",async()=>{
  for(const expiresAt of [undefined,Date.now()-1]) {
    const f=await setup();
    await assert.rejects(runBuyerTrace(f.plan,{...f.options,expiresAt},f));
    assert.equal(f.signs(),0);
  }
});
test("approval expires while waiting for challenge",async t=>{
  const f=await setup(), now=Date.now();
  const send=f.send;
  f.send=async r=>{const response=await send(r);t.mock.method(Date,"now",()=>now+700_000);return response;};
  await assert.rejects(runBuyerTrace(f.plan,f.options,f));
  assert.equal(f.signs(),0);
});
test("approval shorter than SDK validity is refused before reservation",async()=>{
  const f=await setup(),expiresAt=Date.now()+120_000;
  f.options={...f.options,expiresAt,authorization:mintOwnerCliPurchaseAuthorization(buyerTraceIntent(f.plan,f.options.sessionFile!,expiresAt))};
  let sends=0;f.send=async()=>{sends++;throw new Error("Must not send");};
  await assert.rejects(runBuyerTrace(f.plan,f.options,f));
  assert.equal(sends,0);assert.equal(f.signs(),0);
  await assert.rejects(access(f.options.sessionFile!));
});
test("insufficient SDK validity after challenge never signs",async t=>{
  const f=await setup(),now=Date.now(),send=f.send;
  f.send=async r=>{const response=await send(r);t.mock.method(Date,"now",()=>now+350_000);return response;};
  await assert.rejects(runBuyerTrace(f.plan,f.options,f));assert.equal(f.signs(),0);
});
for(const settlement of ["reported","failed"]){
  test(`known ${settlement} receipt survives an oversized fulfillment`,async()=>{
    const f=await setup(),send=f.send;
    f.send=r=>r.headers.has("PAYMENT-SIGNATURE")?Promise.resolve(new Response("x".repeat(1_048_577),{headers:{
      "PAYMENT-RESPONSE":encodePaymentResponseHeader({success:settlement==="reported",transaction:"0x"+"ab".repeat(32),network:"eip155:8453"})
    }})):send(r);
    await assert.rejects(runBuyerTrace(f.plan,f.options,f));
    const events=(await readFile(f.options.sessionFile!,"utf8")).trim().split("\n").map(line=>JSON.parse(line));
    assert.equal(events.at(-1).state,"fulfillment-failed");assert.equal(events.at(-1).settlement,settlement);
    assert.equal(events.at(-2).state,"receipt-received");
  });
}
for(const receipt of ["missing","malformed","failed","reported","wrong-network","wrong-amount"]){
  test(`settlement ${receipt} is classified without onchain claims`,async()=>{
    const f=await setup(),send=f.send;
    f.send=async r=>{
      const response=await send(r);
      if(r.headers.has("PAYMENT-SIGNATURE") && receipt!=="missing") response.headers.set("PAYMENT-RESPONSE",
        receipt==="malformed"?"invalid":encodePaymentResponseHeader({success:receipt!=="failed",transaction:"0x"+"ab".repeat(32),network:receipt==="wrong-network"?"eip155:84532":"eip155:8453",amount:receipt==="wrong-amount"?"1":"10000"}));
      return response;
    };
    const result=await runBuyerTrace(f.plan,f.options,f);
    if(result.mode==="dry-run") throw new Error("Expected an acquisition response");
    assert.equal(result.audit.settlement,receipt==="reported"?"reported":receipt==="failed"?"failed":"unknown");
    assert.doesNotMatch(await readFile(f.options.sessionFile!,"utf8"),/SYNTHETIC_NOT_REPLAYABLE/);
  });
}
test("oversized fulfillment is refused with the reservation preserved",async()=>{
  const f=await setup(),send=f.send;
  f.send=r=>r.headers.has("PAYMENT-SIGNATURE")?Promise.resolve(new Response("x".repeat(1_048_577))):send(r);
  await assert.rejects(runBuyerTrace(f.plan,f.options,f));
  await assert.rejects(runBuyerTrace(f.plan,f.options,f));
  assert.equal(f.signs(),1);
});

test("credential completion after timeout cannot start signing",()=>{
  const probe=String.raw`
    import assert from 'node:assert/strict';
    import {mock} from 'node:test';
    globalThis.fetch=()=>{throw new Error('No network authority in this probe');};
    let releaseRead,enteredRead,signatures=0;
    const reading=new Promise(resolve=>{enteredRead=resolve;});
    const released=new Promise(resolve=>{releaseRead=resolve;});
    mock.module('node:fs/promises',{namedExports:{open:async()=>({
      stat:async()=>({isFile:()=>true}),
      read:async buffer=>{enteredRead();await released;const key='0x'+'00'.repeat(32);buffer.write(key);return {bytesRead:key.length};},
      close:async()=>{}
    })}});
    mock.module('viem/accounts',{namedExports:{privateKeyToAccount:()=>({
      address:'0x1111111111111111111111111111111111111111',
      signTypedData:async()=>{signatures++;return '0x'+'11'.repeat(65);}
    })}});
    const {createTraceRuntime}=await import('./src/buyer-trace-runtime.ts');
    const {createBuyerTracePlan,bounded}=await import('./src/buyer-trace-adapter.ts');
    const plan=createBuyerTracePlan(),controller=new AbortController();
    const runtime=createTraceRuntime(plan,'0x1111111111111111111111111111111111111111',Date.now()+600_000,'UNUSED_SYNTHETIC_KEY');
    const operation=runtime.createPayment(plan.requirement,controller.signal);
    const observed=bounded(operation,controller.signal);
    await reading;controller.abort();
    await assert.rejects(observed,error=>error.code==='TRANSPORT_TIMEOUT');
    assert.equal(signatures,0);releaseRead();
    await assert.rejects(operation,error=>error.code==='SIGNING_REFUSED');
    assert.equal(signatures,0);
  `;
  const child=spawnSync(process.execPath,["--experimental-test-module-mocks","--import","tsx","--input-type=module","--eval",probe],
    {encoding:"utf8",timeout:15_000,windowsHide:true});
  assert.equal(child.status,0,"Isolated late-signing regression must pass");
});
