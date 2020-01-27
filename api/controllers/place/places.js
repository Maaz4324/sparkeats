const Promise = require('bluebird');
const { findImageByID } = require('../../../lib/findImage');
const getNumberOfReviews = require('../../../lib/getNumberOfReviews');
const getAvgNumberOfStars = require('../../../lib/getAvgNumberOfStars');
const ratingToString = require('../../../lib/ratingToString');


module.exports = async function places(req, res) {
  Promise.props({
    places: await Place.find({}),
    reviews: await Review.find({
      select: ['numberOfStars', 'placeId'],
    }),
  })
    .then(({ places, reviews }) => {
      return Promise.all(
        places.map(
          async ({
            id,
            placeName,
            city,
            state,
            address,
            phone,
            placeImage: placeImageID,
            placeImageAlt,
            placeURL,
            placeWebsiteDisplay,
          }) => {
            const placeImage = await findImageByID(PlaceImage, placeImageID);
            const { stars, numberOfStars } = getAvgNumberOfStars(
              reviews,
              id
            );

            const rating = ratingToString(numberOfStars);

            let numberOfReviews = getNumberOfReviews(
              reviews,
              id
            );

            return {
              id,
              placeName,
              city,
              state,
              address,
              phone,
              placeImage,
              placeImageAlt,
              placeURL,
              placeWebsiteDisplay,
              numberOfStars,
              stars,
              rating,
              numberOfReviews,
            };
          }
        )
      );
    })
    .then(places => res.view('pages/homepage', { places }))
    .catch(res.serverError);
};