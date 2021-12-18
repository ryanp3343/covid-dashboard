import React, {useEffect, useState} from 'react'
//import { Pie } from 'react-chartjs-2'
import { Helmet } from "react-helmet";
import L from "leaflet";
import { useMap } from "react-leaflet";

import axios from 'axios';          // part 1
import { useTracker } from 'hooks';    // part 2
import { commafy, friendlyDate } from 'lib/util';    // part 2

import Layout from "components/Layout";
import Container from "components/Container";
import Map from "components/Map";
import Snippet from "components/Snippet";
import { element } from "prop-types";

const PieChart = (props) => {
    const [geoJson,setgeoJson] = useState([]);
    useEffect(() =>{
        let country;
        const getCount = async () => {
            try{
                country = await axios.get("https://corona.lmao.ninja/v2/countries")
                const list = country?.data;
                setgeoJson(list)
            } catch(e){
                console.log("failed")
                return
            }
        }
    })
    let country
    let cases 
    country = geoJson.map((ref) =>{
        return{
            country: ref.country,
            value: ref.cases
        }
    })
    console.log("here")
    console.log(country)
    return null
}
export default PieChart