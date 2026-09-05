/** Loopback rehearsal of production parsing/approval/runtime/SDK/adapter paths.
 * Only the owner decision, signer authority and external provider are fixtures.
 * The production executable never imports this module or reads fixture switches.
 */
import assert from "node:assert/strict";
import test, { mock } from "node:test";
import { createServer } from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { encodePaymentRequiredHeader, encodePaymentResponseHeader, decodePaymentSignatureHeader } from "@x402/core/http";
import { createBuyerTracePlan } from "./buyer-trace-adapter.js";

const plan=createBuyerTracePlan();
const wallet="0x1111111111111111111111111111111111111111";
if(process.argv[2]==="--fixture-child") {
  const origin=new URL(process.argv[3]);
  if(origin.hostname!=="127.0.0.1" || origin.protocol!=="http:") throw new Error("Fixture requires loopback");
  const decision=process.argv[4];
  let signingCalls=0;
  // Test-only module substitution, unavailable to the production CLI parser.
  // A fixture signer always shares this process's forced-loopback HTTP boundary.
  Object.defineProperty(process.stdin,"isTTY",{value:true});
  Object.defineProperty(process.stderr,"isTTY",{value:true});
  mock.module("node:readline/promises",{namedExports:{createInterface:()=>({
    question:async(prompt:string)=>decision==="yes"?prompt.slice(5).trim():"DECLINE",close:()=>{}})}});
  mock.module("viem/accounts",{namedExports:{privateKeyToAccount:()=>({address:wallet,signTypedData:async (input: {domain?:{chainId?:number};primaryType:string})=>{
    signingCalls++;assert.equal(Number(input.domain?.chainId),8453);assert.equal(input.primaryType,"TransferWithAuthorization");
    return `0x${"11".repeat(65)}`;
  }})}});
  const nativeFetch=globalThis.fetch;
  globalThis.fetch=async input=>{
    assert.ok(input instanceof Request);assert.equal(input.url,plan.url);
    const u=new URL(input.url);
    const response=await nativeFetch(new URL(u.pathname+u.search,origin),{method:input.method,headers:input.headers,redirect:input.redirect,signal:input.signal});
    Object.defineProperty(response,"url",{value:plan.url});
    if(response.headers.has("x-fixture-expire")) Date.now=()=>9_999_999_999_999;
    return response;
  };
  const {runBuyerTraceCli,traceCliError}=await import("./buyer-trace-cli.js");
  try {
    const result=await runBuyerTraceCli(process.argv.slice(5));
    console.log(JSON.stringify({result,signingCalls}));
  } catch(error) {
    console.log(JSON.stringify({result:traceCliError(error),signingCalls}));process.exitCode=1;
  }
} else {
  test("shopper unknown arguments never echo secret contents",()=>{
    const child=spawnSync(process.execPath,["--import","tsx","src/shopper-cli.ts","--SYNTHETIC_ARGUMENT_SECRET"],
      {encoding:"utf8",timeout:15_000,windowsHide:true});
    assert.equal(child.status,1);
    assert.match(child.stderr,/Unknown shopper argument/);
    assert.doesNotMatch(child.stdout+child.stderr,/SYNTHETIC_ARGUMENT_SECRET/);
  });
  async function fixture(t: import("node:test").TestContext, scenario="success") {
    const directory=await mkdtemp(join(tmpdir(),"trace-cli-e2e-"));
    const approval=join(directory,"review.json"),session=join(directory,"session.jsonl"),keyFile=join(directory,"invalid-fixture-key.txt");
    await writeFile(keyFile,"0x"+"00".repeat(32)); // invalid key; only the mocked signing authority accepts it
    const review={plan:structuredClone(plan),expiresAt:new Date(Date.now()+600_000).toISOString(),sessionBudgetAtomic:"10000",walletAddress:wallet};
    await writeFile(approval,JSON.stringify(review));
    const calls:{paid:boolean}[]=[];
    const server=createServer((request,response)=>{
      const paid=Boolean(request.headers["payment-signature"]);calls.push({paid});
      const expected=new URL(plan.url);
      assert.equal(request.method,"GET");assert.equal(request.url,expected.pathname+expected.search);
      if(scenario==="redirect") {response.writeHead(302,{location:"https://example.invalid/SYNTHETIC_SECRET"});response.end();return;}
      if((scenario==="timeout-before"&&!paid)||(scenario==="timeout-after"&&paid)) return;
      if(!paid) {
        const challenge={x402Version:2,resource:{url:plan.url,description:"fixture",mimeType:"application/json"},accepts:[structuredClone(plan.requirement)]};
        const terms=challenge.accepts[0];
        if(scenario==="price") terms.amount="10001";
        if(scenario==="network") terms.network="eip155:84532";
        if(scenario==="asset") terms.asset=wallet;
        if(scenario==="recipient") terms.payTo=wallet;
        if(scenario==="scheme") terms.scheme="upto";
        if(scenario==="query") challenge.resource.url+="&page=1";
        if(scenario==="alternative") challenge.accepts.push(structuredClone(terms));
        if(scenario==="domain") terms.extra.name="Synthetic Coin";
        response.writeHead(402,{"PAYMENT-REQUIRED":scenario==="malformed"?"bad":encodePaymentRequiredHeader(challenge),
          ...(scenario==="expiry-during-challenge"?{"x-fixture-expire":"yes"}:{})});
        response.end();return;
      }
      const payload=decodePaymentSignatureHeader(String(request.headers["payment-signature"]));
      assert.deepEqual(payload.accepted,plan.requirement);
      assert.equal(payload.x402Version,2);
      if(scenario==="recovery") {response.writeHead(402,{"PAYMENT-REQUIRED":encodePaymentRequiredHeader({x402Version:2,resource:{url:plan.url,description:"retry",mimeType:"application/json"},accepts:[plan.requirement]})});response.end();return;}
      response.writeHead(200,{"Content-Type":"application/json",...(scenario==="missing-receipt"?{}:{"PAYMENT-RESPONSE":encodePaymentResponseHeader({success:scenario!=="failed-receipt",network:"eip155:8453",amount:"10000",transaction:"0x"+"ab".repeat(32)})})});
      if(scenario==="slow-body") {response.flushHeaders();return;}
      response.end(scenario==="oversized"?"x".repeat(1_048_577):JSON.stringify({data:[{private:"SYNTHETIC_PRIVATE_ROW",authorization:"SYNTHETIC_REPLAY_SECRET"}],pagination:{page:0,page_size:100,has_next_page:false}}));
    });
    await new Promise<void>(resolve=>server.listen(0,"127.0.0.1",resolve));
    t.after(()=>{server.closeAllConnections();server.close();});
    const address=server.address();assert.ok(address&&typeof address!=="string");
    const origin=`http://127.0.0.1:${address.port}`;
    async function run(args?:string[],decision="yes",production=false) {
      const actualArgs=args??["--execute","--approval",approval,"--session",session,"--key-file",keyFile, "--timeout-ms","250"];
      const env=Object.fromEntries(Object.entries(process.env).filter(([key])=>["PATH","SYSTEMROOT","WINDIR","COMSPEC","PATHEXT","TEMP","TMP"].includes(key.toUpperCase())));
      const command=[...(!production?["--experimental-test-module-mocks"]:[]),"--import","tsx",...(production?["src/buyer-trace-cli.ts"]:["src/buyer-trace-e2e.test.ts","--fixture-child",origin,decision]),...actualArgs];
      const child=spawn(process.execPath,command,{env,stdio:["ignore","pipe","pipe"],windowsHide:true});
      let stdout="",stderr="";
      child.stdout.on("data",chunk=>{stdout+=chunk;});child.stderr.on("data",chunk=>{stderr+=chunk;});
      const code=await new Promise<number|null>(resolve=>child.on("exit",resolve));
      assert.doesNotMatch(stdout+stderr,/SYNTHETIC_PRIVATE_ROW|SYNTHETIC_REPLAY_SECRET|111111111111111111111111111111111111111111111111111111111111111111/u);
      return {code,output:JSON.parse((stdout||stderr).trim())};
    }
    return {run,calls,approval,session,review};
  }

  test("production CLI dry-run and nonexecuting config validation load no authority",async t=>{
    const f=await fixture(t);
    const dry=await f.run([],"no",true);assert.equal(dry.output.mode,"dry-run");
    const valid=await f.run(["--validate-config","--approval",f.approval,"--session",f.session,"--key-file","SYNTHETIC_UNUSED_KEY"],"no",true);
    assert.equal(valid.output.mode,"config-valid");assert.equal(valid.output.credential,"NOT_LOADED");
    const refused=await f.run(undefined,"yes",true);assert.equal(refused.code,1);
    assert.equal(f.calls.length,0);
  });
  test("production paths construct one SDK payment, redact rows and refuse restart replay",async t=>{
    const f=await fixture(t),result=await f.run();
    assert.equal(result.code,0);assert.equal(result.output.signingCalls,1);
    assert.equal(result.output.result.audit.settlement,"reported");assert.equal(result.output.result.rows,1);
    assert.deepEqual(f.calls,[{paid:false},{paid:true}]);
    const replay=await f.run();assert.equal(replay.code,1);assert.equal(replay.output.signingCalls,0);
    assert.equal(f.calls.length,2);
    const journal=await readFile(f.session,"utf8");assert.match(journal,/sending-outcome-unknown/);assert.match(journal,/reported/);
  });
  test("simultaneous CLI processes cannot acquire twice",async t=>{
    const f=await fixture(t);const results=await Promise.all([f.run(),f.run()]);
    assert.equal(results.filter(r=>r.code===0).length,1);
    assert.equal(f.calls.filter(c=>c.paid).length,1);
  });
  for(const scenario of ["price","network","asset","recipient","scheme","query","alternative","domain","malformed","redirect","expiry-during-challenge","timeout-before"]) {
    test(`CLI ${scenario} refuses before signing`,async t=>{
      const f=await fixture(t,scenario),result=await f.run();
      assert.equal(result.code,1);assert.equal(result.output.signingCalls,0);assert.equal(f.calls.length,1);
    });
  }
  for(const scenario of ["timeout-after","slow-body","oversized","recovery"]) {
    test(`CLI ${scenario} preserves ambiguous reservation without another signature`,async t=>{
      const f=await fixture(t,scenario),result=await f.run();
      assert.equal(result.code,1);assert.equal(result.output.signingCalls,1);
      const again=await f.run();assert.equal(again.code,1);assert.equal(again.output.signingCalls,0);
      assert.equal(f.calls.length,2);assert.match(await readFile(f.session,"utf8"),/outcome-unknown/);
    });
  }
  for(const scenario of ["missing-receipt","failed-receipt"]) {
    test(`CLI ${scenario} does not become settlement success`,async t=>{
      const f=await fixture(t,scenario),result=await f.run();
      assert.equal(result.output.result.audit.settlement,scenario==="missing-receipt"?"unknown":"failed");
      assert.equal(result.output.signingCalls,1);
    });
  }
  for(const drift of ["expired","short-expiry","budget","method","url","page","chain","amount","asset","recipient"]) {
    test(`review ${drift} is refused without HTTP or signing`,async t=>{
      const f=await fixture(t);
      if(drift==="expired") f.review.expiresAt=new Date(Date.now()-1).toISOString();
      if(drift==="short-expiry") f.review.expiresAt=new Date(Date.now()+120_000).toISOString();
      if(drift==="budget") f.review.sessionBudgetAtomic="10001";
      if(drift==="method") (f.review.plan as {method:string}).method="POST";
      if(drift==="url") f.review.plan.url+="&extra=1";
      if(drift==="page") (f.review.plan as {page:number}).page=1;
      if(drift==="chain") f.review.plan.requirement.network="eip155:84532";
      if(drift==="amount") f.review.plan.requirement.amount="1";
      if(drift==="asset") f.review.plan.requirement.asset=wallet;
      if(drift==="recipient") f.review.plan.requirement.payTo=wallet;
      await writeFile(f.approval,JSON.stringify(f.review));
      const result=await f.run();assert.equal(result.code,1);assert.equal(result.output.signingCalls,0);assert.equal(f.calls.length,0);
    });
  }
  test("missing owner decision refuses before HTTP",async t=>{
    const f=await fixture(t),result=await f.run(undefined,"no");
    assert.equal(result.code,1);assert.equal(f.calls.length,0);assert.equal(result.output.signingCalls,0);
  });
}
