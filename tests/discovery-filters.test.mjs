import test from 'node:test'
import assert from 'node:assert/strict'
import { selectDiscoveryEvents, isPastEvent } from '../src/features/public/lib/discovery-filters.ts'
const now = Date.parse('2026-11-11T12:00:00Z')
const events = [
 { id:'past',slug:'past',name:'História Brasília',category:'Esportes',city:'Brasília',starts_at:'2026-10-01T12:00:00Z' },
 { id:'ongoing',slug:'ongoing',name:'Exposição',category:'Cultura',city:'Brasília',starts_at:'2026-11-01T12:00:00Z',ends_at:'2026-12-01T12:00:00Z' },
 { id:'next',slug:'next',name:'Próximo encontro',category:'Cultura',city:'Goiânia',starts_at:'2026-12-02T12:00:00Z' },
 { id:'private',slug:'private',name:'Privado',category:'Cultura',city:'Brasília',starts_at:'2026-12-01T12:00:00Z',is_private:true },
]
const filters = { search:'',category:'all',period:'all',city:'all',savedOnly:false,saved:[] }
test('private events never enter public discovery',()=>assert.ok(!selectDiscoveryEvents(events,filters,now).some(e=>e.id==='private')))
test('ongoing multi-day events are not classified as past',()=>assert.equal(isPastEvent(events[1],now),false))
test('upcoming sort before historical events',()=>assert.deepEqual(selectDiscoveryEvents(events,filters,now).map(e=>e.id),['ongoing','next','past']))
test('search matches accents without requiring accents',()=>assert.deepEqual(selectDiscoveryEvents(events,{...filters,search:'historia brasilia'},now).map(e=>e.id),['past']))
test('period filters distinguish history from upcoming events',()=>{
 assert.deepEqual(selectDiscoveryEvents(events,{...filters,period:'past'},now).map(e=>e.id),['past'])
 assert.deepEqual(selectDiscoveryEvents(events,{...filters,period:'upcoming'},now).map(e=>e.id),['ongoing','next'])
})
test('city and category and saved filters combine rather than override each other',()=>{
 assert.deepEqual(selectDiscoveryEvents(events,{...filters,city:'Brasília',category:'Cultura',savedOnly:true,saved:['ongoing','next']},now).map(e=>e.id),['ongoing'])
})
test('unmatched search and empty saved list return zero results',()=>{
 assert.deepEqual(selectDiscoveryEvents(events,{...filters,search:'nao existe'},now),[])
 assert.deepEqual(selectDiscoveryEvents(events,{...filters,savedOnly:true},now),[])
})
