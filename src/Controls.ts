export class Controls {
    forward: boolean = false;
    left: boolean = false;
    right: boolean = false;
    reverse: boolean = false;

    constructor(controlType: string) {
        switch (controlType) {
            case 'player':
                this.#addKeyboardListeners();
                break;
            case 'traffic':
                this.forward = true;
        }
    }

    #addKeyboardListeners() {
        document.onkeydown = (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    this.left = true;
                    break;
                case 'ArrowRight':
                    this.right = true;
                    break;
                case 'ArrowUp':
                    this.forward = true;
                    break;
                case 'ArrowDown':
                    this.reverse = true;
                    break;
            }
        };

        document.onkeyup = (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    this.left = false;
                    break;
                case 'ArrowRight':
                    this.right = false;
                    break;
                case 'ArrowUp':
                    this.forward = false;
                    break;
                case 'ArrowDown':
                    this.reverse = false;
                    break;
            }
        };
    }
}
