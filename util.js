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
	setTimeout(() => {
		glslCanvas.on('render', done);
		glslCanvas.play();
		renderQueued = false;
	});
	function done() {
		glslCanvas.pause();
		glslCanvas.off('render', done);
	}
}

export function updateVariables() {
	console.log('Setting uniforms');
	variables.forEach(updateVariable);
	document.getElementById('variables').innerHTML =
		variables.map(variable => {
			switch (variable.type) {
				case 'number':
					return `<div>
						<label>
							${variable.name}
							<input type="range"
								data-variable="${variable.name}"
								min="${variable.minimum}"
								max="${variable.maximum}"
								value="${variable.value}">
						</label>
					</div>`;
				case 'checkbox':
					return `<div>
						<label>
							${variable.name}
							<input type="checkbox"
								data-variable="${variable.name}"
								${variable.value ? 'checked' : ''}>
						</label>
					</div>`;
				default: return `<div>Unknown variable type: ${variable.type}</div>`;
			}
		}).join('\n');
}

export function updateVariable(variable) {
	console.log(`Setting ${variable.name} to ${variable.value}`);
	// special-case because bools seem buggy in GlslCanvas at present:
	if (variable.type == 'checkbox')
		glslCanvas.uniform('1i', 'bool', variable.name, !!variable.value);
	else glslCanvas.setUniform(variable.name, variable.value);
	forceRender();
}
