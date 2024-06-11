export const heatmapLayer = (id: string, source: string) => ({
    "id": id,
    "type": "heatmap",
    "source": source,
    "paint": {
      // All points have the same weight (equal importance)
      "heatmap-weight": 1,
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(0, 0, 255, 0)", // Transparent for density 0
        0.2,
        "#00FFFF", // Cyan for density 0.2
        0.3,
        "#00FF7F", // Spring Green for density 0.3
        0.4,
        "#00FF00", // Pure green for density 0.4
        0.5,
        "#7FFF00", // Chartreuse for density 0.5
        0.6,
        "#ADFF2F", // Green-yellow for density 0.6
        0.7,
        "#FFFF00", // Yellow for density 0.7
        0.8,
        "#FFA500", // Orange for density 0.8
        0.9,
        "#FF4500", // Red-orange for density 0.9
        1,
        "#FF0000", // Pure red for density 1
      ],

      // Adjust the heatmap radius by zoom level
      "heatmap-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        0.1,
        7,
        12
      ],              
    "heatmap-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      7,
      0.7,
      12,
      0.1
    ]

    }
  })