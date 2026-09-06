export type CarPreferences={brand:string;budget:string;body:string;year:string;message:string};
export function privateSearchMessage(preferences:CarPreferences){
  return ['Hello Deals On Wheels, I would like help finding my next car.','',`Preferred brand: ${preferences.brand}`,`Budget (USD): ${preferences.budget}`,`Body style: ${preferences.body}`,`Preferred year: ${preferences.year}`,...(preferences.message.trim()?['',`Message: ${preferences.message.trim()}`]:[])].join('\n');
}
export function privateSearchWhatsApp(preferences:CarPreferences){
  return `https://wa.me/96181664448?text=${encodeURIComponent(privateSearchMessage(preferences))}`;
}
