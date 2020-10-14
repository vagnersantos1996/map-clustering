import React from 'react';
import GoogleMapReact from "google-map-react";

const App = () => {
	const API_KEY = process.env.REACT_APP_API_KEY;

	return (
		<div style={{height: "100vh", width: "100%"}}>
			{/* <GoogleMapReact></GoogleMapReact> */}
			{API_KEY}
		</div>
	);
}

export default App;

//Google Maps in React - Building interactive maps
//https://www.youtube.com/watch?v=Pf7g32CwX_s

//Clustering data in Google Maps and React
//https://www.youtube.com/watch?v=-NI5e_GTIko