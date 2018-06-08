const { places, reviews } = require('../migrateYaml');

function seedReviews(place, placeReviews) {
  _.each(
    placeReviews,
    async ({
      'review-text': reviewText,
      'reviewer-name': reviewerName,
      'number-of-stars': numberOfStars,
      'review-image-file-name': reviewImageFileName,
      'review-image-alt': reviewImageAlt,
    }) => {
      try {
        await Review.create({
          reviewerName,
          reviewText,
          reviewImageFileName: reviewImageFileName
            ? reviewImageFileName[0]
            : '',
          reviewImageAlt: reviewImageAlt ? reviewImageAlt[0] : '',
          numberOfStars,
          placeId: place.id,
        });
      } catch (err) {
        console.log('*'.repeat(20));
        console.log(err);
        console.log('*'.repeat(20));
      }
    }
  );
}

function seedPlaces(places) {
  _.each(
    places,
    async (
      {
        city,
        state,
        address,
        phone,
        'place-name': placeName,
        'place-image': placeImage,
        'place-image-alt': placeImageAlt,
        'place-url': placeUrl,
        'place-website-display': placeWebsiteDisplay,
      },
      placeId
    ) => {
      let place;

      try {
        place = await Place.create({
          placeName,
          city,
          state,
          address,
          phone: phone || '',
          placeImage: placeImage || '',
          placeImageAlt: placeImageAlt || '',
          placeUrl: placeUrl || '',
          placeWebsiteDisplay: placeWebsiteDisplay || '',
        })
          .intercept(err => err)
          .fetch();
      } catch (err) {
        console.log('*'.repeat(20));
        console.log(err);
        console.log('*'.repeat(20));
      }

      const placeReviews = _.filter(reviews, review => {
        return review['place-id'] === placeId;
      });

      seedReviews(place, placeReviews);
    }
  );
}

async function bootstrap(done) {
  // Seed Places and Reviews

  // Don't seed if already seeded
  if ((await Place.count()) > 0 || (await Review.count()) > 0) {
    console.log('Already seeded.');
    return done();
  }

  seedPlaces(places);

  require('dotenv').config();
  return done();
}

module.exports.bootstrap = bootstrap;
