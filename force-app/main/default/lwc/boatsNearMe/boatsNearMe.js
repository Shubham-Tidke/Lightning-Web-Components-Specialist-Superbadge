import { api, LightningElement, track , wire } from 'lwc';

// imports
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement {
  @api boatTypeId;
   mapMarkers = [];
   isLoading = true;
   isRendered= false;
  latitude;
  longitude;
  
  // Add the wired method from the Apex Class
  // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
  @wire (getBoatsByLocation,{latitude:'$latitude',longitude:'$longitude',boatTypeId: '$boatTypeId'})
  // Handle the result and calls createMapMarkers
  wiredBoatsJSON({error, data}) { 
    if(data)
    this.createMapMarkers(data);
    else if(error){
        this.dispatchEvent(
            new ShowToastEvent({
                title : ERROR_TITLE,
                message: error.body.message,
                variant : ERROR_VARIANT
            })
        );
        this.isLoading = false;
    }
  }
  // Controls the isRendered property
  // Calls getLocationFromBrowser()
  renderedCallback() {
    if(!this.isRendered){
        this.getLocationFromBrowser();
    }
    this.isRendered = true;
   }
  
  // Gets the location from the Browser
  // position => {latitude and longitude}
  getLocationFromBrowser() { 
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
            position =>{
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
        })
    }
  } 
  // Creates the map markers
  createMapMarkers(boatData) {
     const newMarkers = JSON.parse(boatData).map(boat => {
        return{
            location:{
                Latitude: boat.Geolocation__Latitude__s,
                Longitude: boat.Geolocation__Longitude__s
            },
            title: boat.Name,
        }
     });
     // newMarkers.unshift({...});
     newMarkers.unshift({
        location: {
            Latitude: this.latitude,
            Longitude: this.longitude
        },
        title : LABEL_YOU_ARE_HERE,
        icon : ICON_STANDARD_USER
     })
    this.mapMarkers = newMarkers;
    this.isLoading = false;
   }
}