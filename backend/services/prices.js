// const axios = require("axios");

// exports.getMarketPrices = async (req, res) => {
//   try {
//     const {
//       state,
//       district,
//       market,
//       commodity,
//     } = req.body;

//     console.log("Received Filters:", {
//       state,
//       district,
//       market,
//       commodity,
//     });

//     const params = {
//       "api-key": process.env.DATA_GOV_API_KEY,
//       format: "json",
//       limit: 100,
//     };

//     // Add filters only if value exists
//     if (state?.trim()) {
//       params["filters[state.keyword]"] = state.trim();
//     }

//     if (district?.trim()) {
//       params["filters[district]"] = district.trim();
//     }

//     if (market?.trim()) {
//       params["filters[market]"] = market.trim();
//     }

//     if (commodity?.trim()) {
//       params["filters[commodity]"] =
//         commodity.trim();
//     }

//     const response = await axios.get(
//       "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
//       { params }
//     );

//     const records =
//       response?.data?.records || [];
// console.log(records)
//     console.log(
//       `Records Found: ${records.length}`
//     );

//     return res.status(200).json({
//       success: true,
//       count: records.length,
//       data: records,
//     });

//   } catch (error) {

//     console.log(
//       "Market Price Error:",
//       error?.response?.data ||
//       error.message
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         error?.response?.data?.error ||
//         "Failed to fetch market prices",
//     });
//   }
// };




const axios = require("axios");

exports.getMarketPrices = async (req, res) => {
  try {
    const {
      state,
      district,
      market,
      commodity,
    } = req.body;

    console.log("Received Filters:", {
      state,
      district,
      market,
      commodity,
    });

    const apiKey = process.env.DATA_GOV_API_KEY;

    if (!apiKey) {
      console.error("DATA_GOV_API_KEY is missing");

      return res.status(500).json({
        success: false,
        message: "Government API key is not configured",
      });
    }

    const params = {
      "api-key": apiKey,
      format: "json",
      limit: 100,
    };

    // Add filters only when values are provided
    if (typeof state === "string" && state.trim()) {
      params["filters[state.keyword]"] = state.trim();
    }

    if (typeof district === "string" && district.trim()) {
      params["filters[district]"] = district.trim();
    }

    if (typeof market === "string" && market.trim()) {
      params["filters[market]"] = market.trim();
    }

    if (typeof commodity === "string" && commodity.trim()) {
      params["filters[commodity]"] = commodity.trim();
    }

    const response = await axios.get(
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
      {
        params,
        timeout: 15000,
      }
    );

    const records = response.data?.records || [];

    console.log(`Records Found: ${records.length}`);

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error("Market Price Error:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      response: error.response?.data,
    });

    // Network or connection errors
    const connectionErrors = [
      "ECONNREFUSED",
      "ETIMEDOUT",
      "ECONNABORTED",
      "ENETUNREACH",
      "EHOSTUNREACH",
      "EAI_AGAIN",
      "ENOTFOUND",
    ];

    if (connectionErrors.includes(error.code)) {
      return res.status(503).json({
        success: false,
        message:
          "Market prices are temporarily unavailable. Please try again later.",
      });
    }

    // API returned an HTTP error
    if (error.response) {
      return res.status(error.response.status >= 500 ? 502 : 400).json({
        success: false,
        message:
          error.response.data?.error ||
          "The government market-price API returned an error.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch market prices.",
    });
  }
};