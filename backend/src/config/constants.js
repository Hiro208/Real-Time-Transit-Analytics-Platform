const TERMINAL_MAP = {
  '1': { 'N': { term: '242 St-Van Cortlandt Pk', dir: 'Uptown' }, 'S': { term: 'South Ferry', dir: 'Downtown' } },
  '2': { 'N': { term: 'Wakefield-241 St', dir: 'Uptown' }, 'S': { term: 'Flatbush Av-Brooklyn College', dir: 'Downtown' } },
  '3': { 'N': { term: 'Harlem-148 St', dir: 'Uptown' }, 'S': { term: 'New Lots Av', dir: 'Downtown' } },
  '4': { 'N': { term: 'Woodlawn', dir: 'Uptown' }, 'S': { term: 'Utica Av / Crown Hts', dir: 'Downtown' } },
  '5': { 'N': { term: 'Eastchester-Dyre Av', dir: 'Uptown' }, 'S': { term: 'Flatbush Av', dir: 'Downtown' } },
  '6': { 'N': { term: 'Pelham Bay Park', dir: 'Uptown' }, 'S': { term: 'Brooklyn Bridge-City Hall', dir: 'Downtown' } },
  '7': { 'N': { term: 'Flushing-Main St', dir: 'Eastbound' }, 'S': { term: '34 St-Hudson Yards', dir: 'Westbound' } },
  'A': { 'N': { term: 'Inwood-207 St', dir: 'Uptown' }, 'S': { term: 'Far Rockaway / Lefferts Blvd', dir: 'Downtown' } },
  'C': { 'N': { term: '168 St', dir: 'Uptown' }, 'S': { term: 'Euclid Av', dir: 'Downtown' } },
  'E': { 'N': { term: 'Jamaica Center', dir: 'Queens-bound' }, 'S': { term: 'World Trade Center', dir: 'Manhattan-bound' } },
  'L': { 'N': { term: 'Canarsie-Rockaway Pkwy', dir: 'Eastbound' }, 'S': { term: '8 Av', dir: 'Westbound' } },
  'G': { 'N': { term: 'Court Sq', dir: 'Queens-bound' }, 'S': { term: 'Church Av', dir: 'Brooklyn-bound' } },
  'N': { 'N': { term: 'Astoria-Ditmars Blvd', dir: 'Uptown' }, 'S': { term: 'Coney Island', dir: 'Downtown' } },
  'Q': { 'N': { term: '96 St', dir: 'Uptown' }, 'S': { term: 'Coney Island', dir: 'Downtown' } },
  'R': { 'N': { term: '71 Av-Forest Hills', dir: 'Queens-bound' }, 'S': { term: 'Bay Ridge-95 St', dir: 'Brooklyn-bound' } },
};
const axios = require('axios');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
const db = require('../config/db');
require('dotenv').config();

const MTA_API_KEY = process.env.MTA_API_KEY;

// 定义所有需要抓取的线路 URL
const FEED_URLS = [
  'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',      // 1,2,3,4,5,6,S
  'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',  // A,C,E
  'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm', // B,D,F,M
  'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g',    // G
  'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz',   // J,Z
  'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw', // N,Q,R,W
  'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l',    // L
  'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-si'    // SIR
];

module.exports = { TERMINAL_MAP, FEED_URLS };