# SOP: Adding a New Data Layer

## Steps

1. **Define types** in `src/types/index.ts`
   - Add interface for the data shape
   - Add layer key to `LayerType` union

2. **Add constants** in `src/lib/constants.ts`
   - Add API URL to `API_URLS`
   - Add refresh interval to `REFRESH_INTERVALS`
   - Add layer config to `LAYER_CONFIG` (label, color, icon)

3. **Create data hook** in `src/hooks/use{Name}.ts`
   - Fetch data at interval using `fetchJSON`/`fetchText`
   - Parse response into typed array
   - Update count via `useLayerStore.setCount()`
   - Return `{ data, loading }`

4. **Create layer component** in `src/components/Layers/{Name}Layer.tsx`
   - Import and call the data hook
   - Render Cesium entities (points, billboards, polylines, etc.)
   - Handle click to `useTrackingStore.selectEntity()`

5. **Register in GlobeViewer** in `src/components/Globe/GlobeViewer.tsx`
   - Import the layer component
   - Add conditional render: `{layers.{name} && <{Name}Layer />}`

6. **Update store defaults** in `src/stores/useLayerStore.ts`
   - Add default visibility in `layers`
   - Add initial count in `counts`
