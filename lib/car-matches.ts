import type {CarPreferences} from './private-search';
export type SearchCar={id:string;make:string;model:string;year:number|null;price:number|null;status:string;image_url:string;body_style?:string|null};
const normalize=(value:string)=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const brandKey=(value:string)=>{const key=normalize(value);return ['mercedesbenz','mercedes','mercedesamg'].includes(key)?'mercedes':key};
// Recognize unambiguous model families; unspecified body variants stay unknown.
export function bodyStyle(car:SearchCar):string|null{
 if(car.body_style)return car.body_style;
 const model=car.model.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(/\b(urus|cayenne|defender|escalade|yukon|tahoe|patrol|vogue|x6m|gls)\b|\bg(63|700|800)\b/.test(model)||(car.make==='Land Rover'&&/^sport\b/.test(model)))return 'SUV';
 if(/\b(roadster|spider|cabriolet|convertible|targa)\b/.test(model))return 'Convertible';
 if(/\b(sedan|ghost|taycan|s580e|s560|e43|m5)\b/.test(model))return 'Sedan';
 if(/\b(coupe|huracan|spectre|wraith|berlinetta|gtb|gts)\b|\b488 pista\b|\bcontinental gt\b|\br8\b|\bg82\b|\b765 lt\b|\b911\b/.test(model))return 'Coupe';
 return null;
}
const budgets:Record<string,[number,number]>={'Under $50,000':[0,50000],'$50,000–$100,000':[50000,100000],'$100,000–$200,000':[100000,200000],'$200,000–$350,000':[200000,350000],'$350,000+':[350000,Infinity]};
export function findCarMatches(cars:SearchCar[],preferences:CarPreferences){
 const range=budgets[preferences.budget];
 return cars.filter(car=>{
  if(car.status!=='in-stock')return false;
  if(preferences.brand!=='No preference'&&brandKey(car.make)!==brandKey(preferences.brand))return false;
  if(preferences.body!=='No preference'&&bodyStyle(car)!==preferences.body)return false;
  if(preferences.year!=='No preference'){
   if(!car.year)return false;
   if(preferences.year==='2024 or newer'&&car.year<2024)return false;
   if(preferences.year==='2020–2023'&&(car.year<2020||car.year>2023))return false;
   if(preferences.year==='2015–2019'&&(car.year<2015||car.year>2019))return false;
   if(preferences.year==='Before 2015'&&car.year>=2015)return false;
  }
  return !range||!car.price||(car.price>=range[0]&&car.price<range[1]);
 }).map(car=>({car,budgetUnconfirmed:!!range&&!car.price})).sort((a,b)=>Number(a.budgetUnconfirmed)-Number(b.budgetUnconfirmed)||(b.car.year||0)-(a.car.year||0));
}
