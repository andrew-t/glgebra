import { updateVariable } from './util.js';

const animating = {};

export function playVariable(variable) {
	// Might replace this with some richer truthy object down the line, maybe when bounce comes in.
	animating[variable.name] = true;
}

export function pauseVariable(variable) {
	animating[variable.name] = false;
}

document.addEventListener('DOMContentLoaded', e => update());

let lastTime = 0;
function update(now) {
	requestAnimationFrame(update);
	const dt = Math.min(now - lastTime, 200) / 1000;
	lastTime = now;
	for (const [ variableName, variableAnimating ] of Object.entries(animating))
		if (variableAnimating) {
			const variable = variables.find(v => v.name == variableName);
			if (!variable) {
				console.warn('No longer animating orphaned variable', variableName);
				delete animating[variableName];
			}
			const range = variable.maximum - variable.minimum,
				delta = range * dt / (variable.period || 10),
				el = document.querySelector(`input[data-variable="${variableName}"]`);
			variable.value += delta;
			if (variable.value > variable.maximum) {
				if (variable.animation == 'loop') variable.value -= range;
				else {
					variable.value = variable.maximum;
					delete animating[variableName];
				}
			}
			if (el) el.value = variable.value;
			updateVariable(variable);
		}
}
