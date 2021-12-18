import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import L from "leaflet";
import { useMap } from "react-leaflet";
import PieChart from "../components/pie";
import Chart from 'chart.js/auto';
import { Pie } from "react-chartjs-2";

import axios from 'axios';          // part 1
import { useTracker } from 'hooks';    // part 2
import { commafy, friendlyDate } from 'lib/util';    // part 2

import Layout from "components/Layout";
import Container from "components/Container";
import Map from "components/Map";
import Snippet from "components/Snippet";
import { element } from "prop-types";



const LOCATION = {
  lat: 34.0522,
  lng: -118.2437,
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;

const IndexPage = () => {
  const { data: countries = [] } = useTracker({
    api: 'countries'
  });

  const { data: stats = {} } = useTracker({ api: 'all' });
  

  async function mapEffect(map) { 

    let response;            // part 1
    let responseStates;
    console.log('MapEffect automatically called, calling axios.get()');

    try { 
      response = await axios.get('https://corona.lmao.ninja/v2/countries');
      responseStates = await axios.get("https://disease.sh/v3/covid-19/jhucsse");
    } catch(e) { 
      console.log('Failed to fetch countries: ${e.message}', e);
      return;
    }

    const { data = [] } = response;   // part 1
    let states = responseStates?.data;
    states = states.filter((ref) => ref.province);


    const hasData = Array.isArray(data) && data.length > 0  && Array.isArray(states)  && states.length > 0;  // part 1
    if ( !hasData ) return;
    
    const geoJson = {
      type: 'FeatureCollection',
      // features: countries.map((country = {}) => {    // part 2
      features: data.map((country = {}) => {      // part 1
        const { countryInfo = {} } = country;
        const { lat, long: lng } = countryInfo;
        return {
          type: 'Feature',
          properties: {
            ...country,
          },
          geometry: {
            type: 'Point',
            coordinates: [ lng, lat ]
          }
        }
      })
    }
    const geoJsonStates = {
      type: "FeatureCollection",
      features: states.map((ref = {}) => {
        const { coordinates = {} } = ref;
        const { latitude: lat, longitude: lng } = coordinates;
        return {
          type: "Feature",
          properties: {
            ...ref,
          },
          geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
        };
      }),
    };

    const geoJsonLayers = new L.GeoJSON(geoJson, {
      pointToLayer: (feature = {}, latlng) => {
        const { properties = {} } = feature;
        let updatedFormatted;
        let casesString;
    
        const {
          country,
          updated,
          cases,
          deaths,
          recovered
        } = properties
    
        casesString = `${cases}`;
    
        if ( cases > 1000 ) {
          casesString = `${casesString.slice(0, -3)}k+`
        }
    
        if ( updated ) {
          updatedFormatted = new Date(updated).toLocaleString();
        }

    
        const html = `
          <span class="icon-marker">
            <span class="icon-marker-tooltip">
              <h2>${country}</h2>
              <ul>
                <li><strong>Confirmed:</strong> ${cases}</li>
                <li><strong>Deaths:</strong> ${deaths}</li>
                <li><strong>Recovered:</strong> ${recovered}</li>
                <li><strong>Last Update:</strong> ${updatedFormatted}</li>
              </ul>
            </span>
            ${ casesString }
          </span>
        `;
      
        return L.marker( latlng, {
          icon: L.divIcon({
            className: 'icon',
            html,
    
          }),
          riseOnHover: true
        });
      }
    });
    const geoJsonStatesLayer = new L.GeoJSON(geoJsonStates, {
      pointToLayer: (feature = {}, latlng) => {
        const { properties = {} } = feature;
        let updatedFormatted;
        let casesString;
        const { 
          province, 
          stats,
          updatedAt 
        } = properties;


        casesString = `${stats?.confirmed}`;

        if (stats?.confirmed > 1000) {
          casesString = `${casesString.slice(0, -3)}k+`;
        }

        if (updatedAt) {
          updatedFormatted = new Date(updatedAt).toLocaleString();
        }

        const html = `
          <span class="icon-marker2">
            <span class="icon-marker-tooltip">
              <h2>${province}</h2>
              <ul>
                <li><strong>Confirmed: </strong>${stats?.confirmed}</li>
                <li><strong>Deaths: </strong>${stats?.deaths}</li>
                <li><strong>Update: </strong>${updatedFormatted}</li>
              </ul>
            </span>
            ${casesString}
          </span>
        `;
        return L.marker(latlng, {
          icon: L.divIcon({
            className: "icon",
            html,
    
          }),
          riseOnHover: true,
        });
      },
    });

    console.log('@WILL -- about to complete geoJson');


    geoJsonLayers.addTo(map);
    geoJsonStatesLayer.addTo(map);



  }




  const mapSettings = {
    center: [18.786717,-12.071043],
    defaultBaseMap: "OpenStreetMap",
    zoom: DEFAULT_ZOOM,
    whenCreated: mapEffect,
  };


  return (
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>

      <div className="tracker">
        <Map {...mapSettings} />

        <div className="tracker-stats">
          <ul>
            <li className="tracker-stat">
              <p className="tracker-stat-primary">
                { stats ? commafy( stats?.tests ) : '-' }
                <strong>Total Tests</strong>
              </p>
              <p className="tracker-stat-secondary">
                { stats ? commafy( stats?.testsPerOneMillion ) : '-' }
                <strong>Per 1 Million</strong>
              </p>
            </li>
            <li className="tracker-stat">
              <p className="tracker-stat-primary">
                { stats ? commafy( stats?.cases ) : '-' }
                <strong>Total Cases</strong>
              </p>
              <p className="tracker-stat-secondary">
                { stats ? commafy( stats?.casesPerOneMillion ) : '-' }
                <strong>Per 1 Million</strong>
              </p>
            </li>
            <li className="tracker-stat">
              <p className="tracker-stat-primary">
                { stats ? commafy( stats?.deaths ) : '-' }
                <strong>Total Deaths</strong>
              </p>
              <p className="tracker-stat-secondary">
                { stats ? commafy( stats?.deathsPerOneMillion ) : '-' }
                <strong>Per 1 Million</strong>
              </p>
            </li>
            <li className="tracker-stat">
              <p className="tracker-stat-primary">
                { stats ? commafy( stats?.active ) : '-' }
                <strong>Active</strong>
              </p>
            </li>
            <li className="tracker-stat">
              <p className="tracker-stat-primary">
                { stats ? commafy( stats?.critical ) : '-' }
                <strong>Critical</strong>
              </p>
            </li>
            <li className="tracker-stat">
              <p className="tracker-stat-primary">
                { stats ? commafy( stats?.recovered ) : '-' }
                <strong>Recovered</strong>
              </p>
            </li>
          </ul>
        </div>
 

        <div className="tracker-last-updated">
          <p>Last Updated: { stats ? friendlyDate( stats?.updated ) : '-' }</p>
        </div>
      </div>
      <Container type="content" className="text-center home-start">
        <h2>Demo Mapping App with Gatsby and React Leaflet</h2>
        <h3> Links to info: https://corona.lmao.ninja/v2/countries, https://disease.sh/v3/covid-19/jhucsse </h3>
      </Container>
    </Layout>
    
  );
};

export default IndexPage;
