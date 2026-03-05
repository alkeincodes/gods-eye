export const flirShader = /* glsl */ `
  uniform sampler2D colorTexture;
  uniform float u_time;
  in vec2 v_textureCoordinates;

  // FLIR thermal palette: black -> blue -> magenta -> red -> yellow -> white
  vec3 thermalPalette(float t) {
    if (t < 0.2) {
      // Black to dark blue
      return mix(vec3(0.0), vec3(0.0, 0.0, 0.5), t / 0.2);
    } else if (t < 0.4) {
      // Dark blue to magenta
      return mix(vec3(0.0, 0.0, 0.5), vec3(0.7, 0.0, 0.7), (t - 0.2) / 0.2);
    } else if (t < 0.6) {
      // Magenta to red
      return mix(vec3(0.7, 0.0, 0.7), vec3(1.0, 0.1, 0.0), (t - 0.4) / 0.2);
    } else if (t < 0.8) {
      // Red to yellow
      return mix(vec3(1.0, 0.1, 0.0), vec3(1.0, 1.0, 0.0), (t - 0.6) / 0.2);
    } else {
      // Yellow to white
      return mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 1.0, 1.0), (t - 0.8) / 0.2);
    }
  }

  void main() {
    vec2 uv = v_textureCoordinates;
    vec3 color = texture(colorTexture, uv).rgb;

    // Luminance as "temperature"
    float temp = dot(color, vec3(0.299, 0.587, 0.114));

    // Apply thermal palette
    vec3 thermal = thermalPalette(temp);

    // Edge detection (Sobel-like)
    float dx = length(texture(colorTexture, uv + vec2(0.001, 0.0)).rgb - texture(colorTexture, uv - vec2(0.001, 0.0)).rgb);
    float dy = length(texture(colorTexture, uv + vec2(0.0, 0.001)).rgb - texture(colorTexture, uv - vec2(0.0, 0.001)).rgb);
    float edge = sqrt(dx * dx + dy * dy);

    // Overlay edges
    thermal += edge * 0.5;

    // Slight blur effect (sample nearby pixels)
    vec3 blur = vec3(0.0);
    float blurSize = 0.0008;
    blur += texture(colorTexture, uv + vec2(-blurSize, -blurSize)).rgb;
    blur += texture(colorTexture, uv + vec2( blurSize, -blurSize)).rgb;
    blur += texture(colorTexture, uv + vec2(-blurSize,  blurSize)).rgb;
    blur += texture(colorTexture, uv + vec2( blurSize,  blurSize)).rgb;
    float blurTemp = dot(blur / 4.0, vec3(0.299, 0.587, 0.114));
    thermal = mix(thermal, thermalPalette(blurTemp), 0.15);

    out_FragColor = vec4(thermal, 1.0);
  }
`;
