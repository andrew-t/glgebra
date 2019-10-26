export const variables = [
	{
		name: 'speed', type: 'number', value: 160,
		minimum: 0, maximum: 200
	}, {
		name: 'x_flutter', type: 'number', value: 50,
		minimum: 0, maximum: 100
	}, {
		name: 'y_flutter', type: 'number', value: 20,
		minimum: 0, maximum: 100
	}, {
		name: 'amplitude', type: 'number', value: 10,
		minimum: 0, maximum: 100
	}, {
		name: 'black_bg', type: 'checkbox', value: false
	}
];

export const glsl = `#ifdef GL_ES
precision highp float;
#endif

// built-ins
uniform vec2 u_resolution;
uniform float u_time;

// glgebra variables
uniform float speed;
uniform float x_flutter;
uniform float y_flutter;
uniform float amplitude;
uniform bool black_bg;

float sdf(vec3 ray) {
	return ray.y + 0.5
		+ sin(ray.z * x_flutter * 0.1 + u_time * (1.0 - speed * 0.01))
			* cos(ray.x * y_flutter * 0.1)
			* amplitude * 0.01;
}

mat2 rotate(float theta) {
	float s = sin(theta), c = cos(theta);
	return mat2(c, s, -s, c);
}

const vec2 epsilon = vec2(0.01, 0.0);
vec3 normal(vec3 ray) {
	return normalize(vec3(
		sdf(ray + epsilon.xyy) - sdf(ray - epsilon.xyy),
		sdf(ray + epsilon.yxy) - sdf(ray - epsilon.yxy),
		sdf(ray + epsilon.yyx) - sdf(ray - epsilon.yyx)
	));
}

const vec3 light = normalize(vec3(-0.6, 0.8, 0.2));

vec3 bg = black_bg
	? vec3(-1000.0) // black whatever the lights do
	: vec3(1000.0); // white whatever the lights do

void main() {
	vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
	vec3 ray = normalize(vec3(uv, 1.0));
	vec3 cam = vec3(0.0);
	ray.yz *= rotate(-1.0); // made up number
	ray.xy *= rotate(-0.5); // radians, about 30º
	ray.xz *= rotate(-1.0); // made up number
	
	for (int i = 0; i < 100; ++i)
		cam += ray * sdf(cam) * 0.9;
	
	// gl_FragColor = vec4(fract(cam * 3.0), 1.0); return;
	
	vec3 n = normal(cam);
	// gl_FragColor = vec4(n * 0.5 + 0.5, 1.0); return;
	float l = dot(n, light);
	l += pow(l, 5.0);
	
	vec3 col = bg;
	float pos = (cam.x + 0.6);
	if (pos < 0.0)
		col = bg;
	else if (pos < 0.16666)
		col = vec3(0.89, 0.01, 0.01);
	else if (pos < 0.33333)
		col = vec3(1.0, 0.55, 0.0);
	else if (pos < 0.5)
		col = vec3(1.0, 0.93, 0.0);
	else if (pos < 0.66666)
		col = vec3(0.0, .5, 0.15);
	else if (pos < 0.83333)
		col = vec3(0.0, 0.3, 1.0);
	else if (pos < 1.0)
		col = vec3(0.46, 0.03, 0.53);

	gl_FragColor = vec4(col * l, 1.0);
}

`;
