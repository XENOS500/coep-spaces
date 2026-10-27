const Venue = require('../models/venue');
const {findClash} = require('./availabilityService');
const MAX_DAYS_AHEAD = 30;

//to make sure all req fields are filled
async function validateBookingInput(body){
    const{ venueId, eventName, contactInfo, startTime,endTime, studCount} = body;
    if (!venueId || !eventName || !contactInfo || !startTime || !endTime || !studCount){
        return {error: {status : 400, message: 'Please fill in all required fields'}};
        //to make sure all req fields are filled
    }
}
// valid dates
const start = new Date(startTime);
const end = new Date(endTime);
if (isNaN(start.getTime()) || isNaN(end.getTime())){
    return {error: {status : 400, message :  'Invalid date or time'}};
}
//if start before end
if (start>=end){
    return {error:{status :400, message : 'End time must be after start time' }};
}
//within 30 day window
const maxDate = new Date(now.getTime() + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000);
  if (start > maxDate) {
    return { error: { status: 400, message: `Bookings can only be made ${MAX_DAYS_AHEAD} days ahead` } };
}
//student count should be whole number
if (!Number.isInteger(Number(studCount)) || Number(guestCount)<1) {
    return {error : {status : 400, message : 'Guest count must be a whole number'}}
}
//to check if venue exists, is active and is big enough
const venue= await Venue.findById(venueId);
if (!venue){
    return {error: {status : 404 , message : 'Venue not found'}};
}
if (venue.isActive === false){
    return {error: {status : 404 , message : 'Venue is not available for booking'}};
}
if (Number(studCount)> venue.capacity){
    return {error: {status : 409 , message:`Guest count exceeds venue capacity (${venue.capacity})`}};
}
// check for clash
const clash = await findClash(venueId , start, end);
if (clash){
    return {error: {status : 409, message : 'Venue is already booked for this time slot'}};
}
return {start, end , venue};
module.exports = {validateBookingInput};