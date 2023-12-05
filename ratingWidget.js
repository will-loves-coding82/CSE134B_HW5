class RatingWidget extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});

        this.selectedNumStars = 0;
        this.selectedStarIndex = -1;

        this.shadowRoot.innerHTML =     `
            <style> 
                @import './variables.css';

                #jsFormContainer {
                    max-width: 800px;
                    margin: auto;
                    font-family: var(--font-family-base);
                    text-align: center;
                    color: inherit;
                }

                button {
                    background-color: black;
                    color: white;
                    font-size: 24px;
                    border-radius: 10px;
                    padding: 4px 16px;
                    border: none;
                    cursor: pointer;
                    margin-top: 20px;
                    font-family: var(--font-family-base);


                }

                #starGrid {
                    margin: 0;
                }

                .star {
                    font-size: 56px;
                    cursor: pointer;
                    margin: 0 12px;
                    color: var(--star-default);
                    transition: color 0.08s ease-in;
                }

                .default {
                    color: var(--star-default);
                }

                .selected {
                   color: var(--star-focused);
                }

                .hovered {
                    color: var(--star-hovered);
                }

                #ratingFeedback {
                    background: lightgrey;
                    height: 24px;
                    padding: 30px;
                    border-radius: 20px;
                    text-align: center;

                }



                
            </style>
            <div id = "jsFormContainer">
                <slot name = "form">default</slot>

                <h2>Rating Widget</h2>
                <p id = "ratingFeedback"><p>
                <div id = "starGrid"></div>
                <button id = "jsFormSubmit">Submit</button>

            </div>


         `
    }

    

    connectedCallback() {

        this.document = document.documentElement;

        this.$form = this.querySelector("form");
        this.rateInput = this.querySelector("#rating");

        this.jsForm = this.shadowRoot.querySelector("#jsFormContainer");
        this.starGrid = this.shadowRoot.querySelector("#starGrid");

        this.submitButton = this.shadowRoot.querySelector("#jsFormSubmit");
        this.feedback =this.shadowRoot.querySelector("#ratingFeedback");


        if(this.rateInput) {
            this.min = parseInt(this.rateInput.getAttribute("min"));
            this.max = parseInt(this.rateInput.getAttribute("max"));
            console.log(this.min)
            console.log(this.max)

        }

        
  
        if(this.$form) {
            console.log(this.$form)

            this.$form.style.display = 'none';


             // Create stars and append them to the jsForm
             for (let i = 0; i < this.max; i++) {
                const star = document.createElement("span");
                star.id= `star${i}`;
                star.classList.add("star");
                star.innerHTML = `&#x2605;`; // Unicode character for a star
                this.starGrid.appendChild(star);

                star.addEventListener('mouseover' , e => {
                    console.log(`hovered over star ${i}`)
                    this.addHighlight(i);
                } )

                star.addEventListener('mouseout' , e => {
                    console.log(`hovered out star ${i}`)
                    this.removeHighlight(i);

                } )

                star.addEventListener('click' , e => {
                    console.log(`clicked  star ${i}`)
                    this.selectRating(i);
                } )
            }

            this.submitButton.addEventListener('click', e => {
                
                // e.preventDefault();
                let xhr = new XMLHttpRequest();

                let formData = new FormData(this.$form);
                console.log(this.$form)

                console.log(formData)

                // Set up the request
                xhr.open('POST', 'https://httpbin.org/post', true);
                xhr.setRequestHeader('X-Sent-By', 'JavaScript');

                // Set up a function to handle the response
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        // On success, display the response
                        console.log('Success:', xhr.responseText);

                    } else {
                        console.error('Error:', xhr.statusText);
                    }
                };

                // Handle network errors
                xhr.onerror = function() {
                    console.error('Network Error');
                };

                // Send the request
                xhr.send(formData);
        
            })
        }  
    }


    // Adds hover color
    addHighlight(index) {
        if (this.selectedNumStars == 0) {
            this.shadowRoot.querySelectorAll("span.star").forEach((star, i) => {
                if (i >= 0 && i <= index ) {
                    star.classList.add('hovered')

                }
            })

        }
       
    }

      
    // When mouse moves out of focus, remove hover color
    removeHighlight(index) {

        if (this.selectedNumStars > 0) {
            return;
        }

        if (this.selectedNumStars == 0) {
            this.shadowRoot.querySelectorAll("span.star").forEach((star, i) => {
                if (i >= 0 && i <= index ) {
                    star.classList.remove('selected')
                    star.classList.remove('hovered')
                } 
            })
        }
    }


    // When use clicks on a star
    selectRating(index) {

        // if we previously selected a star
        if (this.selectedNumStars > 0 ) {

            // reset all stars if we toggle the previously selected star index
            if (index  == this.selectedNumStars - 1) {
                this.selectedNumStars = 0;
                this.rateInput.setAttribute("value", this.selectedNumStars.toString());

                console.log(this.rateInput.getAttribute("value"))
                this.shadowRoot.querySelectorAll("span.star").forEach((star, i) => {
                    if (i >= 0 && i <= index ) {
                        star.classList.remove('selected')
                        star.classList.add('default')

                    }
                })

                this.clearMessage();

            }
        }

        

        else {
            this.selectedNumStars = index + 1;
            this.rateInput.setAttribute("value", this.selectedNumStars.toString());

            console.log(this.rateInput.getAttribute("value"))
            this.shadowRoot.querySelectorAll("span.star").forEach((star, i) => {
                if (i >= 0 && i <= index ) {
                    star.classList.remove('hovered')

                    star.classList.add('selected')

                }
            })

            this.updateMessage();

        }

        this.selectedStarIndex = index;
        console.log(`selected index is ${index}`)
       
    }


    updateMessage() {
        const ratio = this.selectedNumStars / this.max;
        if (ratio <= 0.5) {
            this.feedback.textContent= `Thanks for your ${this.selectedNumStars} star rating. We'll try to do better`
        }

        if (ratio > 0.5  && ratio < 0.8) {
            this.feedback.textContent= `Thanks for your ${this.selectedNumStars} star rating. We're glad you are satisfactory`
        }
        if (ratio >= 0.8) {
            this.feedback.textContent= `Thanks for your awesome ${this.selectedNumStars} star rating!!`

        }

    }

    clearMessage() {
        this.feedback.textContent = "";
    }
  
    



}


customElements.define('rating-widget', RatingWidget);