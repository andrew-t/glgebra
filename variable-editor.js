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
	setValue('var-animation', v ? v.animation : 'none');
	setValue('var-period', v ? v.period : '10');
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
	variableEditor.setAttribute('data-variable', variable ? variable.name : '');
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
		for (const el of document.querySelectorAll(`#variable-editor input`))
			if (window.getComputedStyle(el).display != 'none' &&
				!el.validity.valid) {
				alert('Please complete all the fields');
				return;
			}
		const name = getValue('var-name');
		if (variable) {
			variable.name = name;
			if (variable.type == 'number') {
				variable.minimum = getNumber('var-min');
				variable.maximum = getNumber('var-max');
				variable.animation = getValue('var-animation');
				if (variable.animation != 'none')
					variable.period = getNumber('var-period');
				else delete variable.period;
			}
		} else if (variables.some(v => v.name == name)) {
			alert('Name is already used');
			return;
		} else {
			if (getValue('var-type') == 'checkbox')
				variables.push({ type: 'checkbox', name });
			else {
				const minimum = getNumber('var-min'),
					animation = getValue('var-animation'),
					variable = {
						name,
						type: 'number',
						minimum,
						maximum: getNumber('var-max'),
						value: minimum
					};
				if (animation != 'none')
					variable.period = getNumber('var-period');
				variables.push(variable);
			}
		}
		variableEditor.classList.add('hidden');
		updateVariables();
	})
});
