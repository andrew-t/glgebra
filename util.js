export function onClick(id, cb) {
	document.getElementById(id).addEventListener('click', cb);
}

export function recompile() {
	const canvas = document.getElementById('shader');
	canvas.width = canvas.clientWidth * devicePixelRatio;
	canvas.height = canvas.clientHeight * devicePixelRatio;
	document.getElementById('error').innerHTML = '';
	setTimeout(() => {
		glslCanvas.load(document.getElementById('editor').value);
		updateVariables();
	});
}

export function updateVariables() {
	variables.forEach(updateVariable);
	document.getElementById('variables').innerHTML =
		variables.map(variable =>
			`<div>
				<label>
					${variable.name}
					<input type="range"
						data-variable="${variable.name}"
						min="${variable.minimum}"
						max="${variable.maximum}"
						value="${variable.value}">
				</label>
			</div>`).join('\n');
}

export function updateVariable(variable) {
	glslCanvas.setUniform(variable.name, variable.value);
}
