const money = value => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(value);
const key='hc-claims-v1';
const escapeHtml = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function coverage(amount,care) {
 return care==='Dental care'?0:Math.round(Math.min(50000,Math.max(0,amount-1000)*.8)*100)/100;
}
function readClaims() {
 const saved=localStorage.getItem(key);
 if(saved) {
  const data=JSON.parse(saved);
  if(!Array.isArray(data)) throw new Error('Invalid saved data');
  return data;
 }
 const now=new Date().toISOString();
 const samples=[
  {id:'HC-DEMO01',provider:'Sample Care Clinic',care:'Consultation',bill:4500,reference:'SAMPLE-101',status:'Approved'},
  {id:'HC-DEMO02',provider:'Demo Diagnostic Centre',care:'Diagnostics',bill:12000,reference:'SAMPLE-102',status:'Under review'},
  {id:'HC-DEMO03',provider:'Example Hospital',care:'Hospitalisation',bill:68000,reference:'SAMPLE-103',status:'Submitted'}
 ].map(c=>({...c,date:now.slice(0,10),created:now,history:[{status:'Submitted',note:'Sample claim created.',at:now},...(c.status==='Submitted'?[]:[{status:c.status,note:'Illustrative reviewer activity.',at:now}])]}));
 localStorage.setItem(key,JSON.stringify(samples));
 return samples;
}
function saveClaims(claims){localStorage.setItem(key,JSON.stringify(claims));}
function report(error){document.querySelector('#feedback').textContent='Browser data could not be accessed. Enable browser storage and reload to use the demo.';}
const form=document.querySelector('#claim-form');
if(form){
 const bill=document.querySelector('#bill'),care=document.querySelector('#care'),date=document.querySelector('#date');
 const today=new Date();const localDate=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);
 date.max=localDate;date.value=localDate;
 function estimate(){
  const box=document.querySelector('#estimate');
  if(!bill.validity.valid){box.textContent='Enter a valid bill amount between ₹1 and ₹10,00,000.';return;}
  const amount=Number(bill.value),covered=coverage(amount,care.value);
  box.innerHTML='<dl><div><dt>Bill amount</dt><dd>'+money(amount)+'</dd></div><div><dt>Estimated coverage</dt><dd>'+money(covered)+'</dd></div><div><dt>Your estimated share</dt><dd class="large">'+money(amount-covered)+'</dd></div></dl><p>'+(care.value==='Dental care'?'Dental care is excluded in this sample policy.':'Coverage = 80% × (bill − ₹1,000), with a ₹50,000 cap. Bills below the deductible have no coverage.')+'</p>';
 }
 bill.addEventListener('input',estimate);care.addEventListener('change',estimate);estimate();
 form.addEventListener('submit',event=>{
  event.preventDefault();
  const message=document.querySelector('#form-message');
  const provider=document.querySelector('#provider').value.trim(),reference=document.querySelector('#reference').value.trim();
  if(!provider||!reference){message.textContent='Enter a provider and invoice reference.';return;}
  try{
   const claims=readClaims();
   if(claims.some(c=>c.reference.toLowerCase()===reference.toLowerCase())){message.textContent='That invoice reference is already in use. Review My claims before submitting again.';return;}
   const now=new Date().toISOString(),id='HC-'+crypto.randomUUID().slice(0,8).toUpperCase();
   claims.unshift({id,provider,reference,care:care.value,bill:Number(bill.value),date:date.value,created:now,status:'Submitted',history:[{status:'Submitted',note:'Demo claim submitted for review.',at:now}]});
   saveClaims(claims);
   location.href='./claims.html?id='+encodeURIComponent(id);
  }catch(error){message.textContent='Your claim could not be saved. Check that browser storage is available.';}
 });
}
const rows=document.querySelector('#rows');
const isAdmin=location.pathname.endsWith('/admin.html');
function render(){
 if(!rows)return;
 try{
  let claims=readClaims();
  const metrics=document.querySelector('#metrics');
  if(metrics){
   const items=[['Total claims',claims.length],['Awaiting decision',claims.filter(c=>['Submitted','Under review'].includes(c.status)).length],['Approved',claims.filter(c=>c.status==='Approved').length],['Approved estimate',money(claims.filter(c=>c.status==='Approved').reduce((sum,c)=>sum+coverage(c.bill,c.care),0))]];
   metrics.innerHTML=items.map(([label,value])=>'<div class="metric"><span>'+label+'</span><strong>'+value+'</strong></div>').join('');
   claims=claims.slice(0,5);
  }
  const search=document.querySelector('#search')?.value.toLowerCase()||'',filter=document.querySelector('#filter')?.value||'';
  claims=claims.filter(c=>(c.id+' '+c.provider+' '+c.reference).toLowerCase().includes(search)&&(!filter||c.status===filter));
  rows.innerHTML=claims.map(c=>'<tr><td><strong>'+escapeHtml(c.id)+'</strong><small>'+escapeHtml(c.provider)+'</small></td><td>'+escapeHtml(c.care)+'</td><td>'+money(c.bill)+'</td><td>'+money(coverage(c.bill,c.care))+'</td><td><span class="status" data-status="'+escapeHtml(c.status)+'">'+escapeHtml(c.status)+'</span></td><td><button class="secondary" data-id="'+escapeHtml(c.id)+'">'+(isAdmin?'Review':'View')+'</button></td></tr>').join('');
  document.querySelector('#empty').hidden=claims.length>0;
 }catch(error){report(error);}
}
function openClaim(id){
 try{
  const claim=readClaims().find(c=>c.id===id);
  if(!claim)return;
  const content=document.querySelector('#detail-content'),covered=coverage(claim.bill,claim.care);
  const terminal=['Approved','Rejected'].includes(claim.status);
  content.innerHTML='<p class="eyebrow">CLAIM DETAILS</p><h2>'+escapeHtml(claim.id)+'</h2><p>'+escapeHtml(claim.provider)+' · '+escapeHtml(claim.care)+'</p><p>Service date '+escapeHtml(claim.date)+'<br>Invoice '+escapeHtml(claim.reference)+'</p><p>Bill '+money(claim.bill)+'<br>Estimated coverage '+money(covered)+'<br>Estimated member share '+money(claim.bill-covered)+'</p><h3>Activity history</h3><ol class="timeline">'+claim.history.map(h=>'<li><strong>'+escapeHtml(h.status)+'</strong><br>'+escapeHtml(h.note)+'<br><small>'+escapeHtml(new Date(h.at).toLocaleString())+'</small></li>').join('')+'</ol>';
  if(isAdmin&&!terminal){
   content.insertAdjacentHTML('beforeend','<form id="review-form"><label for="review-note">Review note (required)</label><textarea id="review-note" required maxlength="500" rows="3" placeholder="Explain this demo decision"></textarea><div class="actions">'+(claim.status==='Submitted'?'<button class="secondary" value="Under review">Start review</button>':'<button class="button" value="Approved">Approve</button><button class="secondary" value="Rejected">Reject</button>')+'</div><p id="review-message" role="status"></p></form>');
   document.querySelector('#review-form').addEventListener('submit',e=>{
    e.preventDefault();
    const note=document.querySelector('#review-note').value.trim(),next=e.submitter.value;
    if(!note){document.querySelector('#review-message').textContent='Add a review note.';return;}
    try{
     const current=readClaims(),record=current.find(c=>c.id===id);
     if(!record||record.status!==claim.status){document.querySelector('#detail').close();render();openClaim(id);return;}
     record.status=next;record.history.push({status:next,note,at:new Date().toISOString()});saveClaims(current);
     render();openClaim(id);
    }catch(error){document.querySelector('#review-message').textContent='The decision could not be saved.';}
   });
  }
  const dialog=document.querySelector('#detail');if(!dialog.open)dialog.showModal();
 }catch(error){report(error);}
}
rows?.addEventListener('click',e=>{const button=e.target.closest('[data-id]');if(button)openClaim(button.dataset.id);});
document.querySelector('#close')?.addEventListener('click',()=>document.querySelector('#detail').close());
document.querySelector('#search')?.addEventListener('input',render);
document.querySelector('#filter')?.addEventListener('change',render);
window.addEventListener('storage',()=>{document.querySelector('#detail')?.close();render();});
render();
const selected=new URLSearchParams(location.search).get('id');
if(selected&&rows)openClaim(selected);
