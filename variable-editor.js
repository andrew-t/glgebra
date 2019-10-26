import { onClick, updateVariables } from './util.js';

let variableEditor,
	variable;

export default function open(v) {
	variable = v;
	setValue('var-name', v ? v.name : '');
	setValue('var-min', v ? v.minimum : 0);
	setValue('var-max', v ? v.maximum : 100);
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

document.addEventListener('DOMContentLoaded', e => {
	variableEditor = document.getElementById('variable-editor');
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
