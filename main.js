const createBarsArray = function (range){

    function createBar(heightValue){
        const div = document.createElement('div');
        div.style.height = `${heightValue * proportion}%`;
        return div;
    }

    function shuffleArray(array) {

        // Fisher-Yates (aka Knuth) Shuffle.
        // Concept from http://sedition.com/perl/javascript-fy.html
        let currentIndex = array.length,  randomIndex;
      
        // While there remain elements to shuffle...
        while (currentIndex != 0) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [ array[currentIndex], array[randomIndex] ] = [ array[randomIndex], array[currentIndex] ];
        }
    }

    const array = Array.from({length: range}, (_, index) => index + 1);

    shuffleArray(array);

    return { 
        valueArray: array,
        divArray: array.map(createBar)
    };
};

const swapLogic = async function(idx1, idx2, {valueArray, divArray, delayTiming}){

    const sleepFn = () => new Promise(_ => setTimeout(_, delayTiming));

    await sleepFn();

    const value1 = valueArray[idx1],
        value2 = valueArray[idx2];

    // Swapping original values
    valueArray[idx1] = value2;
    valueArray[idx2] = value1;

    // Altering respective bar heights
    divArray[idx1].style.height = `${value2 * proportion}%`;
    divArray[idx2].style.height = `${value1 * proportion}%`;
}

// Impure function
function createNewGraph(){
    const { valueArray, divArray } = createBarsArray(range);
    divArray.forEach(child => container.append(child) );
    sortingDetails = { ...sortingDetails, valueArray, divArray };
}

// Impure function
function alterRange(inp){

    // Resetting children
    container.innerHTML = '';

    range = inp;
    proportion = 100 / range;
    createNewGraph();
}

// Impure function
function alterSpeed(speed){
    delayTiming = speed;
    sortingDetails.delayTiming = delayTiming;
}

const SortingAlgos = (function (){

    async function bubbleSort(sortingProps){

        const { valueArray } = sortingProps;
     
        for(let i = 0; i < valueArray.length; i++)
          for(let j = 0; j < ( valueArray.length - i - 1 ); j++)
            if(valueArray[j] > valueArray[j+1])
                await swapLogic(j, j+1, sortingProps);
    }

    return {
        bubbleSort,
    };

}());


// Html elements
const container = document.getElementById('bar-container');

let range, proportion, delayTiming, sortingDetails;

// Initial setting
alterRange(50);
alterSpeed(5);

SortingAlgos.bubbleSort(sortingDetails);
