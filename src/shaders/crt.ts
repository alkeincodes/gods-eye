export const crtShader = /* glsl */ `
  uniform sampler2D colorTexture;
  uniform float u_time;
  in vec2 v_textureCoordinates;

  void main() {
    vec2 uv = v_textureCoordinates;

    // Screen curvature distortion
    vec2 centered = uv * 2.0 - 1.0;
    float barrel = 0.15;
    centered *= 1.0 + barrel * dot(centered, centered);
    uv = centered * 0.5 + 0.5;

    // Out-of-bounds check
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      out_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    // Chromatic aberration (RGB split)
    float aberration = 0.002;
    float r = texture(colorTexture, uv + vec2(aberration, 0.0)).r;
    float g = texture(colorTexture, uv).g;
    float b = texture(colorTexture, uv - vec2(aberration, 0.0)).b;
    vec3 color = vec3(r, g, b);

    // Green phosphor tint
    color = vec3(
      color.r * 0.2,
      color.g * 0.9 + (color.r + color.b) * 0.15,
      color.b * 0.2
    );

    // Scanlines
    float scanline = sin(uv.y * 800.0) * 0.08;
    color -= scanline;

    // Flicker
    float flicker = sin(u_time * 8.0) * 0.02 + 0.98;
    color *= flicker;

    // Vignette
    float vignette = 1.0 - 0.5 * dot(centered, centered);
    color *= vignette;

    // Brightness boost
    color *= 1.3;

    out_FragColor = vec4(color, 1.0);
  }
`;
