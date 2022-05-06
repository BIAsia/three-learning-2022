# three-learning-2022
mostly following Yuri's tutorial/stream

### icosahedron-glsl
- three
    - icosahedron geometry
    - postProcessing
    - mouseEvent: speed
    - multi shaders
- glsl
    - noise func (3d perlin, hash22)
    - normalize
    - eyeVector
    - diffuse
    - coodinary
    - uv transform
    - fresnel
    - refracted
    - apply texture

### perlin-particles
- three
    - bloomPass
    - mouseEvent: mousemove
    - Points -> particle
    - particle style adjustment
- glsl
    - disc: to make particles round
    - noise func (curl, snoise)
    - dist: to make mouse interactions
    - smoothstep, step, mix

### color-noisy
- three
    - tCube: CubeRenderTarget, CubeCamera
- glsl
    - refract & reflect
    - line shape texture
    - rotate2D
    - mix color with pattern
    - noise func (using Gelfond's constant)
