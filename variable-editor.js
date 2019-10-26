import { onClick, updateVariables } from './util.js';

let variableEditor,
	typeSelector, animationSelector,
	variable;

export default function open(v) {
	variable = v;
	setValue('var-name', v ? v.name : '');
	setValue('var-type', v ? v.type : 'number');
	setValue('var-min', v ? v.minimum : 0);
	setValue('var-max', v ? v.maximum : 100);
	updateAttributes();
	variableEditor.classList.remove('hidden');
}

function setValue(id, value) {
	document.getElementById(id).value = value;
}
function getValue(id) {
	return document.getElementById(id).value;
}
function getNumber(id) {
	return parseFloat(getValue(id));
}

function updateAttributes() {
	variableEditor.setAttribute('data-type', typeSelector.value);
	variableEditor.setAttribute('data-animation', animationSelector.value);
}

document.addEventListener('DOMContentLoaded', e => {
	variableEditor = document.getElementById('variable-editor');
	typeSelector = document.getElementById('var-type');
	animationSelector = document.getElementById('var-animation');
	typeSelector.addEventListener('change', updateAttributes);
	animationSelector.addEventListener('change', updateAttributes);

	onClick('var-cancel', () => variableEditor.classList.add('hidden'));
	onClick('var-ok', () => {
		const name = getValue('var-name');
		if (variable) {
			variable.name = name;
			variable.minimum = getNumber('var-min');
			variable.maximum = getNumber('var-max');
		} else if (variables.some(v => v.name == name)) {
			alert('Name is already used');
			return;
		} else {
			const minimum = getNumber('var-min');
			variables.push({
				name,
				minimum,
				maximum: getNumber('var-max'),
				value: minimum
			});
		}
		variableEditor.classList.add('hidden');
		updateVariables();
	})
});
