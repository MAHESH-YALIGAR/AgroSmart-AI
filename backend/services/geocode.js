
const axios = require("axios");

async function resolveLocationFromPlace(state, district, taluka, place) {

    const fullAddress =
        `${place}, ${taluka}, ${district}, ${state}, India`;

    try {

        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: fullAddress,
                    format: "json",
                    limit: 1
                },
                headers: {
                    "User-Agent": "AgroSmartAI"
                }
            }
        );

        if (response.data.length === 0) {
            return {
                type: "Point",
                coordinates: [0, 0]
            };
        }

        const result = response.data[0];
        console.log(" langitude",parseFloat(result.lon),"latitudksdfj",parseFloat(result.lat))
        return {
            type: "Point",
            coordinates: [
                parseFloat(result.lon),
                parseFloat(result.lat)
            ]
        };

    } catch (err) {

        console.log(err);

        return {
            type: "Point",
            coordinates: [0, 0]
        };

    }

}

module.exports = {
    resolveLocationFromPlace
};