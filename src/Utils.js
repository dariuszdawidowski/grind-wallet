/**
 * Utils
 */


export function formatWithSpaces(inputString, everyNCharacters, fromLeft = true) {
    let result = '';

    if (fromLeft) {
        for (let i = 0; i < inputString.length; i++) {
            result += inputString[i];

            if ((i + 1) % everyNCharacters === 0 && i !== inputString.length - 1) {
                result += ' ';
            }
        }
    } else {
        for (let i = inputString.length - 1, j = 1; i >= 0; i--, j++) {
            result = inputString[i] + result;

            if (j % everyNCharacters === 0 && i !== 0) {
                result = ' ' + result;
            }
        }
    }

    return result;
}


export function formatCurrency(value, fixed = 2) {
    const s = value.toFixed(fixed).toString()
    const [whole, fractional] = s.split('.');
    return formatWithSpaces(whole, 3, false) + '.' + fractional;
}
