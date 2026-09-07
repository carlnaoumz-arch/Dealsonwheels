export type CollectionFilters={brand:string;query:string;budget:string;year:string};
const key=(text:string)=>text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function filterCollection<T extends {make:string;model:string;price:number|null;year:number|null}>(cars:T[],filters:CollectionFilters){return cars.filter(car=>{
 if(filters.brand!=='All'&&car.make!==filters.brand)return false;
 const words=filters.query.trim().split(/\s+/).map(key).filter(Boolean),text=key(`${car.make} ${car.model} ${car.year||''}`);
 if(!words.every(word=>text.includes(word)))return false;
 if(filters.budget==='enquire'&&car.price)return false;
 if(filters.budget!=='all'&&filters.budget!=='enquire'){
  if(!car.price)return false;
  if(filters.budget==='premium'){if(car.price<350000)return false}
  else if(filters.budget==='50000'?car.price>=50000:car.price>Number(filters.budget))return false;
 }
 if(filters.year!=='all'){
  if(!car.year)return false;
  if(filters.year==='older'){if(car.year>=2015)return false}
  else {const min=Number(filters.year);if(car.year<min||(min===2020&&car.year>2023)||(min===2015&&car.year>2019))return false}
 }
 return true;
})}
