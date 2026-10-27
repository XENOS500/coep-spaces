import Venue from "../models/venue.js";

export const getVenues = async (req, res) => {
    try {
        const venues = await Venue.find({isActive : true});
        res.json(venues);
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({message : "Failed to fetch venues"});
    }
};

export const getVenueById = async (req, res) => {
    try {
        const venue = await Venue.findOne( {_id : req.params.id, isActive : true} );

        if(!venue){
            return res.status(404).json({message : "Venue not found"});
        }

        res.json(venue);
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({message : "Failed to fetch venue"});
    }
};

export const addVenue = async (req, res) => {
    try {
        const venue = new Venue(req.body);
        const savedVenue = await venue.save();

        res.status(201).json(savedVenue);
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({message : "Failed to add venue"});
    }
};

export const updateVenue = async (req, res) => {
    try {
        //format --> findOneandUpdate(condition , updatation , options)
        const venue = await Venue.findOneAndUpdate(
            { _id: req.params.id, isActive: true },
            req.body,
            { 
                new: true,            // Return the updated document instead of the old one
                runValidators: true   // Check incoming data against schema rules
            }
        );

        if (!venue) {
            return res.status(404).json({
                message: "Venue not found"
            });
        }

        res.status(200).json(venue);
    }
    catch (error) {
        console.error(error);
        res.status(500).json( {message: "Failed to update venue"} );
    }
};

export const deactivateVenue = async (req, res) => {
    try {
        const venue = await Venue.findByIdAndUpdate(
            req.params.id , 
            { isActive : false } , 
            { new : true , runValidators : true},
        );

        if(!venue){
            return res.status(404).json( {message : "Venue not found"} );
        }

        res.status(200).json(venue);
    } 
    catch (error) {
        console.error(error);
        res.status(500).json( {message : "Failed to deactivate venue"} )
    }
};

export const reactivateVenue = async (req, res) => {
    try {
        const venue = await Venue.findByIdAndUpdate(
            req.params.id,
            { isActive: true },
            { new: true, runValidators: true }
        );

        if (!venue) {
            return res.status(404).json( {message: "Venue not found"} );
        }

        res.status(200).json(venue);
    }
    catch (error) {
        console.error(error);
        res.status(500).json( {message: "Failed to reactivate venue"} );
    }
};