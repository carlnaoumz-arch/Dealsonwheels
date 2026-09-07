import data from './inventory.json';
import {bodyStyle} from './car-matches';
import {modelLabel,conditionLabel,cleanText} from './vehicle-format';
export const cars=data.map(car=>({...car,body_style:bodyStyle(car),exterior_color:cleanText(car.exterior_color)||null,interior_color:cleanText(car.interior_color)||null,make:car.make==='Mercedes'?'Mercedes-Benz':car.make,model:modelLabel(car.model),vehicle_condition:conditionLabel(car.vehicle_condition)}));
export type Car=typeof cars[number];
export const featured=cars.find(c=>c.vin==='ZHWEV4ZD7JLA07350')!;
export const price=(c:Car)=>c.price?`USD ${c.price.toLocaleString('en-US')}`:'Price on request';
export const name=(c:Car)=>`${c.year} ${c.make} ${c.model}`;
export const whatsapp=(c?:Car,test=false)=>`https://wa.me/96181664448?text=${encodeURIComponent(test&&c?`Hello Deals On Wheels, I would like to request a test drive of the ${name(c)}. Please let me know the availability.`:c?`Hello Deals On Wheels, I'm interested in the ${name(c)} and would like more information.`:'Hello Deals On Wheels, I would like more information about your vehicles.')}`;
