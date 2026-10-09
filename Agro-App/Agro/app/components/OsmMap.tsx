import React, { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

export interface MapPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface FocusPoint {
  latitude: number;
  longitude: number;
  key: number; // change this value to re-trigger focusing on the same spot
}

interface Props {
  points: MapPoint[];
  focusPoint?: FocusPoint | null;
  onSelect: (id: string) => void;
  onMapPress?: () => void;
}

const HTML = `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0&icon_names=location_on" />
<style>
  html, body, #map { height: 100%; margin: 0; background: #eef0e8; }
  .pin { color: #e53935; font-family: 'Material Symbols Outlined'; font-size: 42px; font-weight: 400; line-height: 1; font-feature-settings: 'liga'; text-shadow: 0 2px 3px rgba(0,0,0,.35); }
  .store-label { background: #ffffff; border: 1px solid #d1d5db; border-radius: 7px; box-shadow: 0 2px 6px rgba(0,0,0,.2); color: #1f2937; font: 600 12px/16px sans-serif; padding: 3px 7px; white-space: nowrap; }
  .store-label:before { display: none; }
</style>
</head><body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  function post(msg) { window.ReactNativeWebView.postMessage(JSON.stringify(msg)); }

  var map = L.map('map', { zoomControl: false }).setView([12.9716, 77.5946], 11);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  var layer = L.layerGroup().addTo(map);
  var icon = L.divIcon({
    className: '',
    html: '<div class="pin">location_on</div>',
    iconSize: [42, 42],
    iconAnchor: [21, 40]
  });

  map.on('click', function () { post({ type: 'map' }); });

  function setPoints(points) {
    layer.clearLayers();
    var latlngs = [];
    points.forEach(function (p) {
      var m = L.marker([p.latitude, p.longitude], { icon: icon });
      var label = document.createElement('span');
      label.textContent = p.name;
      m.bindTooltip(label, {
        permanent: true,
        direction: 'top',
        offset: [0, -34],
        className: 'store-label'
      });
      m.on('click', function (e) {
        L.DomEvent.stopPropagation(e);
        post({ type: 'select', id: p.id });
      });
      m.addTo(layer);
      latlngs.push([p.latitude, p.longitude]);
    });
    if (latlngs.length === 1) {
      map.setView(latlngs[0], 14);
    } else if (latlngs.length > 1) {
      map.fitBounds(latlngs, { padding: [60, 60] });
    }
  }

  function focusOn(lat, lng) {
    map.setView([lat, lng], Math.max(map.getZoom(), 14), { animate: true });
  }

  post({ type: 'ready' });
</script>
</body></html>`;

export default function OsmMap({ points, focusPoint, onSelect, onMapPress }: Props) {
  const webRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ready) return;
    webRef.current?.injectJavaScript(`setPoints(${JSON.stringify(points)}); true;`);
  }, [points, ready]);

  useEffect(() => {
    if (!ready || !focusPoint) return;
    webRef.current?.injectJavaScript(
      `focusOn(${Number(focusPoint.latitude)}, ${Number(focusPoint.longitude)}); true;`
    );
  }, [focusPoint, ready]);

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === "ready") setReady(true);
      else if (msg.type === "select") onSelect(String(msg.id));
      else if (msg.type === "map") onMapPress?.();
    } catch {
      // ignore malformed messages
    }
  }

  return (
    <WebView
      ref={webRef}
      style={StyleSheet.absoluteFill}
      originWhitelist={["*"]}
      source={{ html: HTML, baseUrl: "https://localhost" }}
      onMessage={handleMessage}
      javaScriptEnabled
      domStorageEnabled
      setSupportMultipleWindows={false}
    />
  );
}
