module.exports = ({ config }) => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!googleMapsApiKey) return config;

  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          ...config.android?.config?.googleMaps,
          apiKey: googleMapsApiKey,
        },
      },
    },
  };
};