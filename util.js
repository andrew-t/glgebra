export function onClick(id, cb) {
	document.getElementById(id).addEventListener('click', cb);
}

export function recompile() {
	const canvas = document.getElementById('shader');
	canvas.width = canvas.clientWidth * devicePixelRatio;
	canvas.height = canvas.clientHeight * devicePixelRatio;
	document.getElementById('error').innerHTML = '';
	setTimeout(() => {
		console.log(`Recompiling shader`);
		glslCanvas.load(document.getElementById('editor').value);
	});
}

let renderQueued = false;
export function forceRender() {
	if (renderQueued || !glslCanvas.paused) return;
	renderQueued = true;
	requestAnimationFrame(() => {
		// You can normally use .render() here but this is needed to support the boolean-uniform hack
		glslCanvas.renderPrograms();
		renderQueued = false;
	});
}

export function updateVariables() {
	console.log('Setting uniforms');
	variables.forEach(updateVariable);
	document.getElementById('variables').innerHTML =
		variables.map(variable => `<div
			class="container paused"
			data-variable="${variable.name}"
		>
			${ renderControls(variable) }
			${ (!variable.animation || variable.animation == 'none') ? '' :
				(button(variable, 'play', 'Play') +
				button(variable, 'pause', 'Pause')) }
			${button(variable, 'edit', 'Edit')}
			${button(variable, 'delete', 'Delete')}
		</div>`).join('\n');
}

function button(variable, func, label) {
	return `<button data-function="${func}" data-variable="${variable.name}">
		${label}
	</button>`;
}

function renderControls(variable) {
	switch (variable.type) {
		case 'number':
			return `<label>
				${variable.name}
				<input type="range"
					data-variable="${variable.name}"
					min="${variable.minimum}"
					max="${variable.maximum}"
					value="${variable.value}">
			</label>`;
		case 'checkbox':
			return `<label>
				${variable.name}
				<input type="checkbox"
					data-variable="${variable.name}"
					${variable.value ? 'checked' : ''}>
			</label>`;
		default: return `<div>Unknown variable type: ${variable.type}</div>`;
	}
}

export function updateVariable(variable) {
	//console.log(`Setting ${variable.name} to ${variable.value}`);
	// special-case because bools seem buggy in GlslCanvas at present:
	if (variable.type == 'checkbox')
		glslCanvas.uniform('1i', 'bool', variable.name, !!variable.value);
	else glslCanvas.setUniform(variable.name, variable.value);
	forceRender();
}
