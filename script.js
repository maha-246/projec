document.addEventListener("DOMContentLoaded", function () {
    const canvas = new fabric.Canvas('canvas', {
        width: 800,
        height: 400
    });
    const stateRadius = 50; // Radius for state circles
    const states = {};
    const initialState = 'q0';
    const finalState = 'q1';

    // Define the DFA's transition function
    const transitions = {
        'q0': { '1': 'q1' },
        'q1': { '1': 'q0' },
    };

    // Function to create a state circle
    function createStateCircle(label, left, top, isFinal) {
        const circle = new fabric.Circle({
            radius: stateRadius,
            fill: 'white',
            stroke: isFinal ? 'green' : 'black',
            strokeWidth: 3
        });

        const text = new fabric.Text(label, {
            fontSize: 20,
            originX: 'center',
            originY: 'center'
        });
        const group = new fabric.Group([circle, text], {
            left: left,
            top: top,
            selectable: false
        });

        canvas.add(group);
        states[label] = group;
    }

    // Function to create transition arrows
    // function createTransitionArrow(fromState, toState, text) {
    //     const fromCircle = states[fromState];
    //     const toCircle = states[toState];
    function createTransitionArrow(fromState, toState, text) {
        const fromCircle = states[fromState];
        const toCircle = states[toState];

        // console.log(fromCircle);
        // console.log(toCircle);

        // Calculate the angle between the centers
        const angle = Math.atan2(toCircle.top - fromCircle.top, toCircle.left - fromCircle.left);

        
        // Calculate the offset from the center to the edge of the circle
        const offsetX = Math.cos(angle) * stateRadius;
        const offsetY = Math.sin(angle) * stateRadius;

        console.log(offsetX);
        console.log(offsetY);


        const startX = 262;
        const startY = 240;
        const endX = 462;
        const endY = 240;

        // Calculate the control point for the quadratic curve
        // This control point ensures the arc shape
        const controlX = (startX + endX) / 2 + offsetY;
        const controlY = (startY + endY) / 2 - offsetX;

        // Draw the quadratic curve for the arrow
        const path = new fabric.Path(`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX}, ${endY}`, {
            fill: '',
            stroke: 'black',
            strokeWidth: 2,
            selectable: false
        });

        // Calculate the midpoint for the label
        // We use the control point to place the label above or below the arc
        const midX = controlX;
        const midY = controlY;
        // Add the text for the transition
        const arrowText = new fabric.Text(text, {
            left: midX,
            top: midY - 10, // Offset the label a bit above the control point
            fontSize: 15,
            originX: 'center',
            originY: 'center'
        });

        canvas.add(path);
        canvas.add(arrowText);
        
    }


    // Initialize the DFA on the canvas
    function initializeDFA() {
        createStateCircle('q0', 150, 175, false); // Adjusted for proper alignment
        createStateCircle('q1', 450, 175, true); // Adjusted for proper alignment

        createTransitionArrow('q0', 'q1', '1');
        createTransitionArrow('q1', 'q0', '1');
    }

    // Create the animated transition circle
    let transitionCircle = new fabric.Circle({
        radius: 10,
        fill: 'red',
        left: 150 + stateRadius, // Adjust for initial position to match q0
        top: 175 + stateRadius, // Adjust for vertical centering
        selectable: false
    });
    canvas.add(transitionCircle);

    // Function to animate the transition
    function animateTransition(fromState, toState) {
        return new Promise((resolve) => {
            const fromCircle = states[fromState];
            const toCircle = states[toState];

            const fromX = fromCircle.left + stateRadius;
            const fromY = fromCircle.top + stateRadius;
            const toX = toCircle.left + stateRadius;
            const toY = toCircle.top + stateRadius;

            // Animate to the next state
            transitionCircle.animate('left', toX - 10, { // Adjusted to end near the center of the next state
                onChange: canvas.renderAll.bind(canvas),
                duration: 1000,
                easing: fabric.util.ease.easeInOutQuad
            });
            transitionCircle.animate('top', toY - 10, { // Adjusted to end near the center of the next state
                onChange: canvas.renderAll.bind(canvas),
                duration: 1000,
                easing: fabric.util.ease.easeInOutQuad,
                onComplete: () => {
                    resolve();
                }
            });
        });

        
    }


    initializeDFA();



    // Function to start the animation based on the input string
    window.checkString = async function () {
        const inputString = document.getElementById("inputString").value;
        const resultElement = document.getElementById("result");

        let currentState = initialState;
        for (const char of inputString) {
            if (transitions[currentState][char]) {
                let nextState = transitions[currentState][char];
                await animateTransition(currentState, nextState);
                currentState = nextState;
            } else {
                currentState = 'rejected';
                break;
            }
        }

        if (currentState === finalState) {
            resultElement.innerText = "Accepted";
        } else {
            resultElement.innerText = "Rejected";
        }
    };
});