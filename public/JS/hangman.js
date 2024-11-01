var Hangman = (function () {
    'use strict';
    function Hangman(elId) {
        this.elId = elId;
        this.words = [
            'PROGRAMMER', 'BRAINSTORM', 'CREATIVE', 'LOLLIPOP',
            'CULTURE', 'RAZORSHARP', 'SCREWDRIVER', 'TYPEWRITER'
        ];
    }

    Hangman.prototype.reset = function () {
        this.STOPPED = false;
        this.MISTAKES = 0;
        this.GUESSES = [];
        this.WORD = this.words[Math.floor(Math.random() * this.words.length)];
        this.hideElementByClass('h');
        this.showElementByIdWithContent(this.elId + "_guessbox", null);
        this.showElementByIdWithContent(this.elId + "_word", this.getGuessedWord());
        document.getElementById(this.elId + "_end").innerHTML = ''; // Clear end message
    };

    Hangman.prototype.guess = function (letter) {
        letter = letter.charAt(0).toUpperCase();
        if (this.STOPPED || this.GUESSES.includes(letter)) {
            return;
        }
        this.GUESSES.push(letter);
        this.showElementByIdWithContent(this.elId + "_word", this.getGuessedWord());
        this.showElementByIdWithContent(this.elId + "_guesses", this.GUESSES.join(' '));

        if (!this.WORD.includes(letter)) {
            this.MISTAKES++;
            this.showElementByIdWithContent(this.elId + "_" + this.MISTAKES, null);
            if (this.MISTAKES === 6) {
                this.showElementByIdWithContent(this.elId + "_end", "GAME OVER!<br/>The word was: " + this.WORD);
                this.STOPPED = true;
            }
        } else if (this.getGuessedWord() === this.WORD) {
            this.showElementByIdWithContent(this.elId + "_end", "You made it!<br/>The word was: " + this.WORD);
            this.STOPPED = true;
        }
    };

    Hangman.prototype.showElementByIdWithContent = function (elId, content) {
        if (content !== null) {
            document.getElementById(elId).innerHTML = content;
        }
        document.getElementById(elId).style.opacity = 1;
    };

    Hangman.prototype.hideElementByClass = function (elClass) {
        const elements = document.getElementsByClassName(elClass);
        for (let element of elements) {
            element.style.opacity = 0;
        }
    };

    Hangman.prototype.getGuessedWord = function () {
        return this.WORD.split('').map(letter => (this.GUESSES.includes(letter) ? letter : "_")).join('');
    };

    return Hangman;
}());

// Initialize the game once the DOM is fully loaded
var gameInstance;
document.addEventListener("DOMContentLoaded", function() {
    gameInstance = new Hangman('hangm');
    gameInstance.reset();
});
