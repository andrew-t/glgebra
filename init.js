import {
	glsl as defaultShader,
	variables as defaultVariables
} from './default-shader.js';
import {
	onClick,
	recompile, forceRender,
	updateVariable, updateVariables
} from './util.js';
import openVariableEditor from './variable-editor.js';
import { playVariable, pauseVariable } from './animation.js';

document.addEventListener('DOMContentLoaded', e => {
	const canvas = document.getElementById('shader'),
		editor = document.getElementById('editor'),
		errorBox = document.getElementById('error'),
		editorPopup = document.getElementById('editor-popup'),
		variableEditor = document.getElementById('variable-editor');
	editor.value = defaultShader;
	window.glslCanvas = new GlslCanvas(canvas);
	window.variables = defaultVariables;
	recompile();
	glslCanvas.pause();

	glslCanvas.on('error', e =>
		errorBox.appendChild(document.createTextNode(e.error)));
	glslCanvas.on('load', updateVariables);

	onClick('recompile', recompile);
	onClick('play', () => {
		document.body.classList.remove('paused');
		glslCanvas.play();
	});
	onClick('pause', () => {
		document.body.classList.add('paused');
		glslCanvas.pause();
	});
	onClick('render', forceRender);

	onClick('recompile', () => {
		recompile();
		editorPopup.classList.add('hidden');
	});
	onClick('open-editor', () => editorPopup.classList.remove('hidden'));
	onClick('close-editor', () => editorPopup.classList.add('hidden'));

	document.getElementById('downscaling')
		.addEventListener('change', recompile);
	window.addEventListener('resize',
		() => setTimeout(recompile));

	onClick('new-variable', () => openVariableEditor());
	onClick('variables', e => {
		const el = e.target,
			variableName = el.getAttribute('data-variable');
		if (!variableName) return;
		const variable = variables.find(v => v.name == variableName);
		if (!variable) throw new Error('Variable not found ' + variableName);
		switch (el.getAttribute('data-function')) {
			case 'edit':
				openVariableEditor(variable);
				break;
			case 'delete':
				window.variables = variables.filter(v => v != variable);
				recompile();
				break;
			case 'play':
				playVariable(variable);
				break;
			case 'pause':
				pauseVariable(variable);
				break;
		}
	});

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
