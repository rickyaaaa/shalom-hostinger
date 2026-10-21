// Read-only check of a prospective structured customer-data export. Does not import or delete.
const fs=require('node:fs');
const path=require('node:path');
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'PRODUCTION-DATA-EXCLUSIONS.json'),'utf8'));
function verify(payload){
  const errors=[];
  for(const key of ['customers','inquiries','reviews','completed_tours'])if(!Array.isArray(payload[key]))errors.push(`Missing explicit ${key} collection`);
  if(errors.length)return errors;
  for(const [collection,ids] of [['customers',manifest.synthetic_customer_ids],['inquiries',manifest.synthetic_inquiry_ids],['reviews',manifest.synthetic_review_ids]]){
    for(const item of payload[collection]){
      if(!item||typeof item!=='object'||!Number.isInteger(item.id)){errors.push(`Unidentified ${collection} record`);continue;}
      if(ids.includes(item.id))errors.push(`Synthetic ${collection} ID ${item.id}`);
      if(collection!=='customers'){
        const owners=[item.user_id,item.customer_id].filter(id=>id!==undefined);
        if(!owners.length||owners.some(id=>!Number.isInteger(id)||id<=0)||new Set(owners).size>1)errors.push(`Unverified owner in ${collection}`);
        if(owners.some(id=>manifest.synthetic_customer_ids.includes(id)))errors.push(`Synthetic owner in ${collection}`);
      }
    }
  }
  for(const item of payload.completed_tours){
    if(!item||!Number.isInteger(item.customer_id)||!Number.isInteger(item.tour_id)||item.customer_id<=0||item.tour_id<=0)errors.push('Unidentified completed Tour relationship');
    else if(manifest.synthetic_customer_ids.includes(item.customer_id))errors.push('Synthetic completed Tour relationship');
  }
  const text=JSON.stringify(payload).toLowerCase();
  for(const marker of manifest.deny_markers)if(text.includes(marker.toLowerCase()))errors.push(`Synthetic marker: ${marker}`);
  return errors;
}
if(process.argv[2]==='--self-test'){
  const empty={customers:[],inquiries:[],reviews:[],completed_tours:[]};
  if(verify(empty).length)throw Error('Empty envelope should pass the fixture check');
  if(verify({customers:[{id:7}],inquiries:[{id:1993,user_id:7}],reviews:[],completed_tours:[{customer_id:7,tour_id:523}]}).length)throw Error('Preserved original records should not be treated as synthetic');
  for(const sample of [
    {...empty,customers:[{id:8}]}, {...empty,inquiries:[{id:1999}]},
    {...empty,reviews:[{id:7}]}, {...empty,reviews:[{id:100,user_id:8}]},
    {...empty,completed_tours:[{customer_id:8,tour_id:523}]},
    {...empty,reviews:[{id:100,user_id:7,experience:'STAGING VALIDATION ONLY'}]}, {},
    {...empty,inquiries:[{id:100,customer_id:'8'}]},
  ])if(!verify(sample).length)throw Error('Synthetic or unspecified export was accepted');
  console.log('PASS: fixture guard rejects eight unsafe/unspecified samples; empty and preserved original records pass');
}else{
  if(!process.argv[2])throw Error('Supply a candidate JSON export; no default staging export is read');
  const errors=verify(JSON.parse(fs.readFileSync(process.argv[2],'utf8')));
  if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
  else console.log('PASS: no listed fixture detected. This does not approve provenance, completeness or production import; owner review/allowlist remains required.');
}
