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

    const params = {
      "api-key": process.env.DATA_GOV_API_KEY,
      format: "json",
      limit: 100,
    };

    // Add filters only if value exists
    if (state?.trim()) {
      params["filters[state.keyword]"] = state.trim();
    }

    if (district?.trim()) {
      params["filters[district]"] = district.trim();
    }

    if (market?.trim()) {
      params["filters[market]"] = market.trim();
    }

    if (commodity?.trim()) {
      params["filters[commodity]"] =
        commodity.trim();
    }

    const response = await axios.get(
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
      { params }
    );

    const records =
      response?.data?.records || [];
console.log(records)
    console.log(
      `Records Found: ${records.length}`
    );

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });

  } catch (error) {

    console.log(
      "Market Price Error:",
      error?.response?.data ||
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        error?.response?.data?.error ||
        "Failed to fetch market prices",
    });
  }
};