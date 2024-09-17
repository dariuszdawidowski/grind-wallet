class GrindCard {

    constructor(args) {

        this.element = document.querySelector(args);
        console.log('GrindCard', this.element)

    }
}

const grind = {

    card: new GrindCard('.card'),

};
