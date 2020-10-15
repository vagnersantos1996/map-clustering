import React, { useState, useRef } from 'react';
import useSwr from "swr";
import GoogleMapReact from "google-map-react";
import useSupercluster from "use-supercluster";
import "./App.css";

// function that recives (and format) the response from useSwt
const fetcher = (...args) => fetch(...args).then(response => response.json());

const Marker = ({children}) => children;

const App = () => {
	// 1) map setup
	const mapRef = useRef();
	const [zoom, setZoom] = useState(10);
	const [bounds, setBounds] = useState(null);

	// 2) load and format data
	const url = "https://data.police.uk/api/crimes-street/all-crime?lat=52.629729&lng=-1.131592&date=2019-10";
	const {data, error} = useSwr(url, fetcher);
	const crimes = data && !error ? data : [];
	const points = crimes.map(crime => (
		{
			type: "Feature",

			// pass anything you want, but the cluster: false is important
			properties: {
				cluster: false,
				crimeId: crime.id,
				category: crime.category
			},
			// lgn first, lat last (in float)
			geometry: {type: "Point", coordinates: [parseFloat(crime.location.longitude), parseFloat(crime.location.latitude)]}
		}
	));

	// 3) get clusters
	const {clusters, supercluster} = useSupercluster({
		points,
		bounds,
		zoom,
		options: {radius: 75, maxZoom: 20}
	});

	// 4) render map
	return (
		<div style={{height: "100vh", width: "100%"}}>
			<GoogleMapReact
				bootstrapURLKeys={{key: process.env.REACT_APP_API_KEY}}
				defaultCenter={{lat: 52.639814, lng: -1.139118}}
				defaultZoom={10}
				yesIWantToUseGoogleMapApiInternals
				onGoogleApiLoaded={({map}) => {
					mapRef.current = map;
				}}
				onChange={({zoom, bounds}) => {
					setZoom(zoom);
					setBounds([
						bounds.nw.lng,
						bounds.se.lat,
						bounds.se.lng,
						bounds.nw.lat,
					]);
				}}
			>
				{clusters.map(cluster => {
					const [longitude, latitude] = cluster.geometry.coordinates;
					const {cluster: isCluster, point_count: pointCount} = cluster.properties;
					if(isCluster) {
						return (
							<Marker key={cluster.id} lat={latitude} lng={longitude}>
								{/* onclick expands the cluster in order to show all the markes */}
								<div
									className="cluster-marker"
									style={{
										width: `${10 + (pointCount/points.length) * 40}px`,
										height: `${10 + (pointCount/points.length) * 40}px`
									}}
									onClick={() => {
										const expansionZoom = Math.min(
											supercluster.getClusterExpansionZoom(cluster.id), 20
										);
										mapRef.current.setZoom(expansionZoom);
										mapRef.current.panTo({lat: latitude, lng: longitude});
									}}
								>
									{pointCount}
								</div>
							</Marker>
						)
					}
					
					return (
						<Marker key={cluster.properties.crimeId} lat={latitude} lng={longitude}>
							<button className="crime-marker">
								<img src="/custody.svg" alt="crime a" />
							</button>
						</Marker>
					);
				})}
			</GoogleMapReact>
		</div>
	);
}

export default App;

//Google Maps in React - Building interactive maps
//https://www.youtube.com/watch?v=Pf7g32CwX_s

//Clustering data in Google Maps and React
//https://www.youtube.com/watch?v=-NI5e_GTIko