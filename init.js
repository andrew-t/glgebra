import {
	glsl as defaultShader,
	variables as defaultVariables
} from './default-shader.js';
import { onClick, recompile, updateVariable, updateVariables } from './util.js';
import openVariableEditor from './variable-editor.js';

document.addEventListener('DOMContentLoaded', e => {
	const canvas = document.getElementById('shader'),
		editor = document.getElementById('editor'),
		errorBox = document.getElementById('error'),
		variableEditor = document.getElementById('variable-editor');
	editor.value = defaultShader;
	window.glslCanvas = new GlslCanvas(canvas);
	window.variables = defaultVariables;
	recompile();

	glslCanvas.on('error', e =>
		errorBox.appendChild(document.createTextNode(e.error)));
	glslCanvas.on('load', updateVariables);

	onClick('recompile', recompile);
	onClick('play', () => glslCanvas.play());
	onClick('pause', () => glslCanvas.pause());
	onClick('new-variable', () => openVariableEditor());

	document.getElementById('variables')
		.addEventListener('input', e => {
			const el = e.target,
				name = el.getAttribute('data-variable'),
				variable = variables.find(v => v.name == name);
			switch (variable.type) {
				case 'number':
					variable.value = parseFloat(el.value);
					break;
				case 'checkbox':
					variable.value = !!el.checked;
					break;
				default:
					console.warn('Unexpected variable type', variable);
					return;
			}
			updateVariable(variable);
		});
});
