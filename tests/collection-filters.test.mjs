import test from 'node:test';
import assert from 'node:assert/strict';
import {filterCollection} from '../lib/collection-filters.ts';
import {modelLabel,conditionLabel} from '../lib/vehicle-format.ts';
const all={brand:'All',query:'',budget:'all',year:'all'};
const cars=[{make:'Porsche',model:'911 Carrera',year:2020,price:195000},{make:'Lamborghini',model:'Huracán LP610-4',year:2015,price:245000},{make:'BMW',model:'M4',year:2024,price:0},{make:'Porsche',model:'911 Targa',year:2018,price:135000}];
test('collection combines model, brand, year and a confirmed-price budget filter',()=>{
 assert.deepEqual(filterCollection(cars,{...all,query:'911',year:'2020',budget:'200000'}),[cars[0]]);
 assert.equal(filterCollection(cars,{...all,query:'huracan LP610'}).length,1);
 assert.equal(filterCollection(cars,{...all,brand:'BMW',budget:'350000'}).length,0);
 assert.deepEqual(filterCollection(cars,{...all,budget:'enquire'}),[cars[2]]);
 assert.equal(filterCollection(cars,{...all,year:'2024'}).length,1);
 assert.equal(filterCollection(cars,{...all,year:'older'}).length,0);
 assert.equal(filterCollection(cars,{...all,query:'not-a-model'}).length,0);
 assert.equal(filterCollection(cars,all).length,4);
});
test('formatting corrects labels without turning missing or numeric condition data into claims',()=>{
 assert.equal(conditionLabel('Exellent Used Conditon'),'Pre-owned');
 assert.equal(conditionLabel('47000'),'Condition to confirm');
 assert.equal(conditionLabel(null),'Condition to confirm');
 assert.equal(conditionLabel('Brand New'),'New');
 assert.equal(modelLabel('G82 M4 COMPETITION'),'M4 Competition');
 assert.equal(modelLabel('𝟒𝟖𝟖 𝐆𝐓𝐁'),'488 GTB');
 assert.equal(modelLabel('Huracan LP610-4'),'Huracán LP610-4');
});
