export const nightVisionShader = /* glsl */ `
  uniform sampler2D colorTexture;
  uniform float u_time;
  in vec2 v_textureCoordinates;

  // Simple hash for noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 uv = v_textureCoordinates;
    vec3 color = texture(colorTexture, uv).rgb;

    // Convert to luminance
    float lum = dot(color, vec3(0.299, 0.587, 0.114));

    // Green channel boost (NVG phosphor)
    vec3 nvg = vec3(lum * 0.1, lum * 1.0, lum * 0.15);

    // Film grain noise
    float grain = hash(uv * 1000.0 + u_time * 10.0) * 0.12;
    nvg += grain * vec3(0.02, 0.08, 0.02);

    // Bloom / glow on bright areas
    float bloom = smoothstep(0.4, 1.0, lum) * 0.3;
    nvg += bloom * vec3(0.05, 0.25, 0.05);

    // Slight vignette
    vec2 centered = uv * 2.0 - 1.0;
    float vignette = 1.0 - 0.3 * dot(centered, centered);
    nvg *= vignette;

    // Brightness
    nvg *= 1.4;

    out_FragColor = vec4(nvg, 1.0);
  }
`;
