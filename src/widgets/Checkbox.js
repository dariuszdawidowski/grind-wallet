import { Component } from '/src/utils/Component.js';


export class Checkbox extends Component {

    constructor(args) {
        super(args);

        // Checkbox
        this.checkbox = document.createElement('input');
        this.checkbox.setAttribute('type', 'checkbox');
        this.element.append(this.checkbox);

        // Initial checked
        if (args.checked !== undefined) this.checkbox.checked = args.checked;

        // Text
        const text = document.createElement('span');
        text.innerHTML = args.text;
        this.element.append(text);

        // Callabck
        if (args.click !== undefined) this.checkbox.onchange = () => {
            args.click(this.checkbox.checked);
        };
    }

    checked() {
        return this.checkbox.checked;
    }

}
