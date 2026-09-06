import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {findCarMatches,bodyStyle} from '../lib/car-matches.ts';
const cars=JSON.parse(fs.readFileSync(new URL('../lib/inventory.json',import.meta.url),'utf8'));
const flexible={brand:'No preference',budget:'Flexible',body:'No preference',year:'No preference',message:''};
test('matches Mercedes aliases and applies year, body and budget together',()=>{
 const matches=findCarMatches(cars,{...flexible,brand:'Mercedes-Benz',body:'Convertible',budget:'$50,000–$100,000',year:'2015–2019'});
 assert.ok(matches.some(({car})=>car.model==='E200 Cabriolet'));
 for(const {car} of matches){assert.equal(car.make,'Mercedes');assert.equal(bodyStyle(car),'Convertible');assert.ok(car.year>=2015&&car.year<=2019);assert.ok(!car.price||(car.price>=50000&&car.price<100000))}
});
test('SUV coupe remains an SUV and open-top models remain convertibles',()=>{
 for(const model of ['Cayenne Coupe','Urus','Defender 110 V8'])assert.equal(bodyStyle({model,make:''}),'SUV');
 for(const model of ['488 Pista Spider','Aventador S LP740-4 Roadster','911 991.2 Targa 4S'])assert.equal(bodyStyle({model,make:''}),'Convertible');
 assert.equal(bodyStyle({model:'Unknown variant',make:''}),null);
});
test('unknown prices are explicit, known over-budget and unavailable cars are excluded',()=>{
 const car=cars[0];const data=[{...car,id:'unknown',price:0},{...car,id:'valid',price:49999},{...car,id:'over',price:50000},{...car,id:'sold',price:20000,status:'sold'}];
 const results=findCarMatches(data,{...flexible,budget:'Under $50,000'});
 assert.deepEqual(results.map(r=>[r.car.id,r.budgetUnconfirmed]),[['valid',false],['unknown',true]]);
 assert.equal(findCarMatches(data,{...flexible,budget:'$50,000–$100,000'})[0].car.id,'over');
});
test('flexible preferences keep all available cars; impossible combinations return none',()=>{
 assert.equal(findCarMatches(cars,flexible).length,cars.filter(c=>c.status==='in-stock').length);
 assert.equal(findCarMatches(cars,{...flexible,brand:'Ferrari',body:'SUV',year:'Before 2015'}).length,0);
 assert.equal(findCarMatches(cars,{...flexible,brand:'Unlisted marque'}).length,0);
});
