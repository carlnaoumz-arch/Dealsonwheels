import data from './inventory.json';
export const cars=data;
export type Car=typeof cars[number];
export const featured=cars.find(c=>c.vin==='ZHWEV4ZD7JLA07350')!;
export const price=(c:Car)=>c.price?`USD ${c.price.toLocaleString('en-US')}`:'Price on request';
export const name=(c:Car)=>`${c.year} ${c.make} ${c.model}`;
export const whatsapp=(c?:Car,test=false)=>`https://wa.me/96181664448?text=${encodeURIComponent(test&&c?`Hello Deals On Wheels, I would like to request a test drive of the ${name(c)}. Please let me know the availability.`:c?`Hello Deals On Wheels, I'm interested in the ${name(c)} and would like more information.`:'Hello Deals On Wheels, I would like more information about your vehicles.')}`;
