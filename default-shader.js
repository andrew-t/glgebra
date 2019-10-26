export const glsl = `#ifdef GL_ES
	precision highp float;
#endif

#define MAXITERS 800.0
#define LENFACTOR .2
#define NDELTA 0.001

// built-ins
uniform vec2 u_resolution;
// variables
uniform float axis_angle;
uniform float const_angle;
uniform float belt_length;
uniform bool spin_camera;
uniform bool draw_axis;
uniform bool many_belts;
uniform bool iter_fog;

#define NDELTAX vec3(NDELTA, 0., 0.)
#define NDELTAY vec3(0., NDELTA, 0.)
#define NDELTAZ vec3(0., 0., NDELTA)

float box(vec3 p, vec3 centre, vec3 dims) {
	vec3 d = abs(p - centre) - dims;
	return max(d.x, max(d.y, d.z));
}

const vec3 rDir = normalize(vec3(-3.0, 4.0, -2.0)), rCol = vec3(1.0, 0.6, 0.4),
	bDir = normalize(vec3(2.0, 3.0, -4.0)), bCol = vec3(0.3, 0.7, 1.0),
	gDir = normalize(vec3(4.0, -3.0, 0.0)), gCol = vec3(0.7, 1.0, 0.8);

// from http://www.neilmendoza.com/glsl-rotation-about-an-arbitrary-axis/
mat3 rotationMatrix(vec3 axis, float angle)
{
	// axis = normalize(axis);
	float s = sin(angle);
	float c = cos(angle);
	float oc = 1.0 - c;
	
	return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s, // 0.0,
				oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s, // 0.0,
				oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);          // 0.0,
			   // 0.0,                                0.0,                                0.0,                                1.0);
}

const float pi = 3.1415926536;

mat2 rot(float t) {
	float s = sin(t), c = cos(t);
	return mat2(c, s, -s, c);
}

vec3 axis() {
	return vec3(
		cos(axis_angle * pi * 4. / 1000.),
		0.,
		sin(axis_angle * pi * 4. / 1000.));
}

vec3 rotSpace(vec3 p) {
	// rotate space!!!
	float angle = pi * pow(smoothstep(100., 2., dot(p, p)), 5.)
		* const_angle / 1000.;
	if (angle <= 0.) return p;
	return p * rotationMatrix(axis(), angle);
}

float scene(vec3 p) {
	p = rotSpace(p);
	
	float l = belt_length / 30.;
	l = 1. + max(0., min(pow(l, 2.), 1000.));
	float d = box(p, vec3(0.), vec3(1.));
	if (draw_axis) {
		vec3 a = axis();
		d = min(d, length(cross(p, a)) - 0.1);
	}
	if (many_belts) {
		for (float a = 0.; a < pi; a += pi * 0.25) {
			d = min(d, length((p * rotationMatrix(vec3(0.,0.,1.),a)).zy) - 0.1);
			d = min(d, length((p * rotationMatrix(vec3(0.,1.,0.),a)).zy) - 0.1);
			d = min(d, length((p * rotationMatrix(vec3(1.,0.,0.),a)).xy) - 0.1);
		}
	} else {
		d = min(d,
		    min(box(p, vec3(0.), vec3(0.1, l, 0.7)),
		    min(box(p, vec3(0.), vec3(l, 0.7, 0.1)),
		        box(p, vec3(0.), vec3(0.7, 0.1, l)))));
	}
	return d;
}
	
vec3 sceneNormal(vec3 p) {
	return normalize(vec3(
		scene(p + NDELTAX) - scene(p - NDELTAX),
		scene(p + NDELTAY) - scene(p - NDELTAY),
		scene(p + NDELTAZ) - scene(p - NDELTAZ)
	));
}


void main()
{
	vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / u_resolution.y;
	vec3 ray = normalize(vec3(uv, 1.));
	ray.yz *= rot(-0.12);
	ray.xz *= rot(-0.7853981634);
	vec3 cam = vec3(10., 2., -10.);
	if (spin_camera) {
		cam.xz *= rot(pi * 0.75 - axis_angle * pi * 4. / 1000.);
		ray.xz *= rot(pi * 0.75 - axis_angle * pi * 4. / 1000.);
	}
	
	vec3 pos = cam;
	float iters = 0.;
	for (float i = 0.; i < MAXITERS; ++i) {
		float dist = scene(pos);
		if (dist < 0.001) { iters = i; break; }
		if (dot(pos, pos) < 100.) dist *= LENFACTOR;
		pos += ray * dist;
	}

	vec3 col = vec3(1.);
	vec3 p2 = rotSpace(pos);
	if (abs(p2.x) > 1.001) col = vec3(1., .757, .224);
	else if (abs(p2.y) > 1.001) col = vec3(0., .576, .5255);
	else if (abs(p2.z) > 1.001) col = vec3(.2902, .204, .365);
	col *= rCol * abs(dot(rDir, sceneNormal(pos))) +
	       gCol * pow(dot(gDir, sceneNormal(pos)), 5.) +
	       bCol * abs(dot(bDir, sceneNormal(pos)));
	if (iter_fog) col *= 1.0 - pow(iters / 300., 2.);
	gl_FragColor = vec4(col, 1.0);
}
`;

export const variables = [
	{
		name: 'axis_angle', type: 'number', value: 0,
		minimum: 0, maximum: 1000,
		animation: 'loop', period: 30
	}, {
		name: 'const_angle', type: 'number', value: 1000,
		minimum: 0, maximum: 1000,
		animation: 'none'
	}, {
		name: 'belt_length', type: 'number', value: 1000,
		minimum: 0, maximum: 1000,
		animation: 'once', period: 20
	}, {
		name: 'spin_camera', type: 'checkbox', value: false
	}, {
		name: 'draw_axis', type: 'checkbox', value: false
	}, {
		name: 'many_belts', type: 'checkbox', value: false
	}, {
		name: 'iter_fog', type: 'checkbox', value: true
	}
];
