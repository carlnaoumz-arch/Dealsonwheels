import test from 'node:test';
import assert from 'node:assert/strict';
import {privateSearchMessage,privateSearchWhatsApp} from '../lib/private-search.ts';
const preferences={brand:'Mercedes-Benz',budget:'$100,000–$200,000',body:'Convertible',year:'2024 or newer',message:'Black & gold?\nPrefer an AMG + warranty.'};
test('WhatsApp handoff preserves all preferences and special characters for the existing sales number',()=>{
 const url=new URL(privateSearchWhatsApp(preferences));
 assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/96181664448');
 assert.equal(url.searchParams.get('text'),privateSearchMessage(preferences));
 assert.equal([...url.searchParams.keys()].length,1);
 for(const value of Object.values(preferences))assert.ok(url.searchParams.get('text').includes(value));
});
test('optional message can be skipped and flexible preferences remain explicit',()=>{
 const message=privateSearchMessage({brand:'No preference',budget:'Flexible',body:'No preference',year:'No preference',message:'   '});
 assert.ok(message.includes('Budget (USD): Flexible'));
 assert.ok(!message.includes('Message:'));
 assert.ok(message.includes('Preferred year: No preference'));
});
